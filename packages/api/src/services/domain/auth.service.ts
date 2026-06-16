import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError } from '../../common/errors/errors';
import { InvalidCredentialsError } from '../../common/errors/generated-graphql-admin-errors';
import { ConfigService } from '../../config/config.service';
import { AuthenticationStrategy } from '../../config/strategies/auth/authentication-strategy.interface';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../config/strategies/auth/native-auth.strategy';
import { ExternalAuthenticationMethod } from '../../entities/authentication-method/external-authentication-method.entity';
import { Session } from '../../entities/session/session.entity';
import { User } from '../../entities/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { LoginAttemptEvent } from '../../event-bus/events/login-attempt-event';
import { LoginEvent } from '../../event-bus/events/login-event';
import { LogoutEvent } from '../../event-bus/events/logout-event';
import { OrmService } from '../../orm/orm.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
		private readonly sessionService: SessionService,
		private readonly eventBus: EventBus,
	) {}

	public async authenticate(
		ctx: RequestContext,
		authStrategyName: string,
		authData: any,
	): Promise<Session | InvalidCredentialsError> {
		await this.eventBus.publish(
			new LoginAttemptEvent(
				ctx,
				authStrategyName,
				authStrategyName === NATIVE_AUTH_STRATEGY_NAME ? authData.identifier : undefined,
			),
		);
		const authStrategy = this.getAuthStrategyByName(ctx, authStrategyName);

		const authResult = await authStrategy.authenticate(ctx, authData);
		if (!authResult) {
			return new InvalidCredentialsError({
				authenticationError: '',
			});
		}
		return await this.startSession(ctx, authResult as User, authStrategyName);
	}

	public async startSession(ctx: RequestContext, user: User, authStrategyName: string): Promise<Session> {
		const extAuths = (user.authenticationMethods ?? []).filter(
			(am) => am instanceof ExternalAuthenticationMethod,
		);
		if (!extAuths.length && this.configService.auth.requireVerification && !user.isVerified) {
			// TODO: throw NotVerifiedAccountError
		}

		if (!user.roles?.[0]?.marketplaceRegions) {
			const userWithRoles = await this.ormService
				.getRepository(ctx, User)
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.roles', 'roles')
				.leftJoinAndSelect('roles.marketplaceRegions', 'mpr')
				.where('user.id = :userId', {
					userId: user.id,
				})
				.getOne();
			user.roles = userWithRoles?.roles ?? [];
		}

		// if we have a ctx.session.activeOrderId, we need to delete all previous sessions associated with this active order

		user.lastAuthenticatedAt = new Date();
		await this.ormService.getRepository(ctx, User).save(user);

		const session = await this.sessionService.createSession(ctx, user, authStrategyName);
		await this.eventBus.publish(new LoginEvent(ctx, user));
		return session;
	}

	/**
	 * @description
	 * Terminates all the sessions of the user associated with the sessionToken
	 */
	public async logout(ctx: RequestContext, sessionToken: string): Promise<void> {
		const session = await this.ormService.getRepository(ctx, Session).findOne({
			where: {
				token: sessionToken,
			},
			relations: {
				user: {
					authenticationMethods: true,
				},
			},
		});

		if (session) {
			const authenticationStrategy = this.getAuthStrategyByName(ctx, session.authenticationStrategy);
			if (typeof authenticationStrategy.onLogout === 'function') {
				await authenticationStrategy.onLogout(ctx, session.user);
			}

			await this.eventBus.publish(new LogoutEvent(ctx));
			await this.sessionService.deleteUserSessions(ctx, session.user);
		}
	}

	private getAuthStrategyByName(ctx: RequestContext, authStrategyName: string): AuthenticationStrategy {
		const { adminAuthenticationStrategies, storeAuthenticationStrategies } = this.configService.auth;

		const foundStrategy = (
			ctx.apiType === 'admin' ? adminAuthenticationStrategies : storeAuthenticationStrategies
		).find((auStr) => auStr.name === authStrategyName);

		if (!foundStrategy) {
			throw new InternalServerError('errors.auth_strategy_not_found', {
				name: authStrategyName,
			});
		}

		return foundStrategy;
	}
}
