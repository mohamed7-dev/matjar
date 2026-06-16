import { RequestContext } from '../../api/request-context/request-context';
import { AppEvent } from '../app-event';

/**
 * @description
 * This event gets fired when a user attempts to login.
 *
 * :::info
 * If the strategy name is native, identifier argument becomes available
 * :::
 */
export class LoginAttemptEvent extends AppEvent {
	constructor(
		public ctx: RequestContext,
		public strategyName: string,
		public identifier?: string,
	) {
		super();
	}
}
