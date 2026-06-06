import { RequestContext } from '../../api/request-context/request-context';
import { User } from '../../entities/user/user.entity';
import { AppEvent } from '../app-event';

export class LoginEvent extends AppEvent {
	constructor(
		public ctx: RequestContext,
		public user: User,
	) {
		super();
	}
}
