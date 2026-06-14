import {
	AuthenticateAdminUserResult,
	AuthenticatedAdminUser,
	AuthenticatedUser,
	MutationAuthenticateAdminUserArgs,
	Success,
} from '@matjar/common/lib/generated-types';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { ForbiddenError } from '../../../common/errors/errors';
import { InvalidCredentialsError } from '../../../common/errors/generated-graphql-admin-errors';
import { isGraphqlApiError } from '../../../common/errors/graphql-api-error';
import { PermissionsIndex } from '../../../common/helpers/permission-index';
import { ConfigService } from '../../../config/config.service';
import { LogLevel } from '../../../config/strategies/logger/logger-strategy.interface';
import { User } from '../../../entities/user/user.entity';
import { AdministratorService } from '../../../services/domain/administrator.service';
import { AuthService } from '../../../services/domain/auth.service';
import { UserService } from '../../../services/domain/user.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import { RequestContext } from '../../request-context/request-context';
import { getSessionToken, setSessionToken } from '../../utils/session-token-utils';

@Resolver()
export class AdminAuthResolver {
	constructor(
		private readonly authService: AuthService,
		private readonly administratorService: AdministratorService,
		private readonly configService: ConfigService,
		private readonly userService: UserService,
	) {}

	@Mutation('authenticateAdminUser')
	@Transaction()
	public async authenticate(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationAuthenticateAdminUserArgs,
		@Context('res') res: Response,
		@Context('req') req: Request,
	): Promise<AuthenticateAdminUserResult> {
		const authInfo = Object.entries(args.input)[0];
		const sessionResult = await this.authService.authenticate(ctx, authInfo[0], authInfo[1]);
		if (isGraphqlApiError(sessionResult)) return sessionResult;

		if (ctx.apiType && ctx.apiType === 'admin') {
			const foundAdmin = await this.administratorService.getOneByUserId(ctx, sessionResult.user.id);
			if (!foundAdmin)
				return new InvalidCredentialsError({
					authenticationError: '',
				});
		}

		setSessionToken({
			res,
			req,
			sessionToken: sessionResult.token,
			authOptions: this.configService.auth,
			rememberMe: args.rememberMe ?? false,
		});
		return this.clientSafeUser(sessionResult.user);
	}

	@Mutation('logoutAdminUser')
	@Transaction()
	@Access({
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async logout(
		@Ctx() ctx: RequestContext,
		@Context('req') req: Request,
		@Context('res') res: Response,
	): Promise<Success> {
		const sessionToken = getSessionToken(req);

		if (!sessionToken) {
			return {
				success: false,
			};
		}

		await this.authService.logout(ctx, sessionToken);

		setSessionToken({
			req,
			res,
			authOptions: this.configService.auth,
			rememberMe: false,
			sessionToken: '',
		});

		return {
			success: true,
		};
	}

	@Query('me')
	@Access({
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async me(@Ctx() ctx: RequestContext): Promise<AuthenticatedUser | null> {
		if (ctx.apiType === 'admin') {
			const admin = await this.administratorService.getOneByUserId(ctx, ctx.activeUserId as string);
			if (!admin) throw new ForbiddenError(LogLevel.Verbose);
		}
		const user = ctx.activeUserId && (await this.userService.getUserById(ctx, ctx.activeUserId));
		return user ? this.clientSafeUser(user) : null;
	}

	private clientSafeUser(user: User): AuthenticatedAdminUser {
		const permissionIndex = PermissionsIndex.build(user);
		return {
			id: user.id,
			identifier: user.identifier,
			marketplaceRegions: PermissionsIndex.normalizeMap(permissionIndex).map((mp) => ({
				id: mp.id,
				token: mp.marketplaceToken,
				code: mp.marketplaceCode,
				permissions: mp.permissions,
			})),
		};
	}
}
