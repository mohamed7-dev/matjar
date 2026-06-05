import type { RequestContext } from '../request-context/request-context';
import type { AccessPolicy } from './access-policy.interface';

export class AuthenticatedPolicy implements AccessPolicy {
	evaluate(ctx: RequestContext): boolean {
		return !!ctx.activeUserId;
	}
}
