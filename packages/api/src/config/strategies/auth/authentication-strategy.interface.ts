import { DocumentNode } from 'graphql';
import { RequestContext } from '../../../api/request-context/request-context';
import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy';
import { User } from '../../../entities/user/user.entity';

export interface AuthenticationStrategy<AuthData = any> extends LifecycleStrategy {
	readonly name: string;
	defineGraphqlInputType(): DocumentNode;
	authenticate(ctx: RequestContext, authData: AuthData): Promise<User | false>;
	onLogout?(ctx: RequestContext, user: User): Promise<void>;
}
