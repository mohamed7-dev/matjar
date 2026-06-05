import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../../config/config.service';
import { SessionCacheEntry } from '../../config/strategies/auth/session-cache-strategy.interface';
import { Logger } from '../../logger/logger';
import { SessionService } from '../../services/domain/session.service';
import { RequestContextService } from '../../services/helpers/request-context.service';
import { attachRequestContext } from '../request-context/request-context-utils';
import { parseContext } from '../utils/parse-context';
import { getSessionToken, setSessionToken } from '../utils/session-token-utils';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(
		private readonly requestContextService: RequestContextService,
		private readonly sessionService: SessionService,
		private readonly configService: ConfigService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const { req, res, info } = parseContext(context);

		const session = await this.getSession(req, res);

		const requestContext = await this.requestContextService.buildFromRequest({
			req,
			graphqlResolveInfo: info,
			session,
		});
		Logger.debug(`Request context was built successfully`, 'AuthenticationGuard');
		attachRequestContext(requestContext, req, context);
		Logger.debug(`Request context was attached to the req object successfully`, 'AuthenticationGuard');
		return true;
	}

	private async getSession(req: Request, res: Response): Promise<SessionCacheEntry | undefined> {
		const sessionToken = getSessionToken(req);
		let cachedSession: SessionCacheEntry | undefined;
		if (sessionToken) {
			cachedSession = await this.sessionService.getSessionByToken(sessionToken);
			if (cachedSession) return cachedSession;
			// if there is a token but it cannot be validated to a Session,
			// then the token is no longer valid and should be unset.
			setSessionToken({
				req,
				res,
				authOptions: this.configService.auth,
				rememberMe: false,
				sessionToken: '',
			});
		}
		return cachedSession;
	}
}
