import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import ms, { type StringValue } from 'ms';
import { RequestContext } from '../../api/request-context/request-context';
import { PermissionsIndex } from '../../common/helpers/permission-index';
import { race } from '../../common/helpers/race';
import { ConfigService } from '../../config/config.service';
import {
	SessionCacheEntry,
	SessionCacheStrategy,
} from '../../config/strategies/auth/session-cache-strategy.interface';
import { Session } from '../../entities/session/session.entity';
import { User } from '../../entities/user/user.entity';
import { OrmService } from '../../orm/orm.service';

@Injectable()
export class SessionService {
	private readonly sessionDurationInMs: number;
	private sessionCacheStrategy: SessionCacheStrategy;

	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
	) {
		const { sessionDuration } = this.configService.auth;
		this.sessionDurationInMs =
			typeof sessionDuration === 'string' ? ms(sessionDuration as StringValue) : sessionDuration;

		this.sessionCacheStrategy = this.configService.auth.sessionCacheStrategy;
	}

	public async getSessionByToken(sessionToken: string): Promise<SessionCacheEntry | undefined> {
		let cachedSession = await race(this.sessionCacheStrategy.get(sessionToken));
		const isCacheStale = !!(cachedSession && cachedSession.cacheExpiry < Date.now() / 1000);
		const isSessionExpired = !!(cachedSession && cachedSession.expiresAt < new Date());
		if (!cachedSession || isCacheStale || isSessionExpired) {
			const session = await this.getValidSessionByToken(sessionToken);
			if (session) {
				cachedSession = this.buildSessionCacheEntry(session);
				await race(this.sessionCacheStrategy.set(cachedSession));
				return cachedSession;
			} else {
				return;
			}
		}
		return cachedSession;
	}

	public async getValidSessionByToken(sessionToken: string): Promise<Session | undefined> {
		const session = await this.ormService.dataSource
			.getRepository(Session)
			.createQueryBuilder('session')
			.leftJoinAndSelect('session.user', 'user')
			.leftJoinAndSelect('user.roles', 'roles')
			.leftJoinAndSelect('roles.marketplaceRegions', 'marketplaceRegions')
			.where('session.revoked = false')
			.andWhere('session.token = :token', {
				token: sessionToken,
			})
			.getOne();

		if (session && session.expiresAt > new Date()) {
			// TODO: update the session expiration if it passes half the duration
			// await this.updateSessionExpiry(session);
			return session;
		}
	}

	public async createSession(ctx: RequestContext, user: User, authStrategyName: string): Promise<Session> {
		const token = await this.generateSessionToken();

		const expires = this.getExpiryDate(this.sessionDurationInMs);

		// TODO: get active order of th user.id and add it to the session

		const session = await this.ormService.getRepository(ctx, Session).save(
			new Session({
				token,
				user,
				authenticationStrategy: authStrategyName,
				expiresAt: expires,
				revoked: false,
			}),
		);

		await race(this.sessionCacheStrategy.set(this.buildSessionCacheEntry(session)));
		return session;
	}

	public async deleteUserSessions(ctx: RequestContext, user: User): Promise<void> {
		const userSessions = await this.ormService.getRepository(ctx, Session).find({
			where: {
				user: {
					id: user.id,
				},
			},
		});
		await this.ormService.getRepository(ctx, Session).remove(userSessions);
		for (const session of userSessions) {
			await race(this.sessionCacheStrategy.delete(session.token));
		}
	}

	public async deleteSessionsByActiveOrderId(ctx: RequestContext, activeOrderId: string): Promise<void> {
		const sessions = await this.ormService.getRepository(ctx, Session).find({
			where: {
				//TODO: add active order where statement after relating session to active order
			},
		});

		await this.ormService.getRepository(ctx, Session).remove(sessions);
		for (const session of sessions) {
			await race(this.sessionCacheStrategy.delete(session.token));
		}
	}

	private buildSessionCacheEntry(session: Session): SessionCacheEntry {
		const { sessionCacheTTL } = this.configService.auth;
		const sessionCacheTTLSeconds =
			typeof sessionCacheTTL === 'string' ? ms(sessionCacheTTL as StringValue) / 1000 : sessionCacheTTL;
		const expiry = Date.now() / 1000 + sessionCacheTTLSeconds;

		const sessionCacheEntry: SessionCacheEntry = {
			id: session.id,
			token: session.token,
			expiresAt: session.expiresAt,
			activeMarketplaceRegionId: session.activeMarketplaceRegion?.id,
			cacheExpiry: expiry,
			authenticationStrategyName: session.authenticationStrategy,
			user: {
				identifier: session.user.identifier,
				id: session.user.id,
				isVerified: session.user.isVerified,
				permissionsIndex: PermissionsIndex.build(session.user),
			},
		};

		return sessionCacheEntry;
	}

	private getExpiryDate(timeToExpireInMs: number): Date {
		return new Date(Date.now() + timeToExpireInMs);
	}

	private generateSessionToken(): Promise<string> {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(32, (err, buf) => {
				if (err) {
					reject(err);
				}
				resolve(buf.toString('hex'));
			});
		});
	}
}
