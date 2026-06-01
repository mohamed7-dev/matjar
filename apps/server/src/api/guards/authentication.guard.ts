import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Logger } from '../../logger/logger';
import { RequestContextService } from '../../services/helpers/request-context.service';
import { attachRequestContext } from '../request-context/request-context-utils';
import { parseContext } from '../utils/parse-context';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(private readonly requestContextService: RequestContextService) {}
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		// 1. resolve context -> req, res
		const { req, info } = parseContext(context);

		// 2. extract session info from the req object
		// 3. build request context from the req object, and attach it to the req object
		const requestContext = this.requestContextService.buildFromRequest({
			req,
			graphqlResolveInfo: info,
		});
		Logger.debug(`Request context was built successfully`, 'AuthenticationGuard');
		attachRequestContext(requestContext, req, context);
		Logger.debug(`Request context was attached to the req object successfully`, 'AuthenticationGuard');
		return true;
	}
}
