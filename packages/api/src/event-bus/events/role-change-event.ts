import { RequestContext } from '../../api/request-context/request-context';
import { Administrator } from '../../entities/administrator/administrator.entity';
import { AppEvent } from '../app-event';

/**
 * @description
 * An event that should be published when a user is assigned or un-assigned a role
 */
export class RoleChangeEvent extends AppEvent {
	constructor(
		public ctx: RequestContext,
		public admin: Administrator,
		public roleIds: string[],
		public type: 'assigned' | 'removed',
	) {
		super();
	}
}
