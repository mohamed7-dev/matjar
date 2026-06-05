import { LifecycleStrategy } from '../../common/types/lifecycle-strategy';
import { RequestContext } from '../request-context/request-context';

export interface AccessPolicy extends LifecycleStrategy {
	/**
	 * @description
	 * This allows us to clone the policy with specific settings (blueprint pattern)
	 */
	withConfig?(options: object): AccessPolicy;
	evaluate(context: RequestContext): Promise<boolean> | boolean;
}
