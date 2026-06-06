import { RequestContext } from '../../../api/request-context/request-context';
import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy';

export interface AssetNamingStrategy extends LifecycleStrategy {
	/**
	 * @description
	 * Creates a unique name for the original file.
	 *
	 * :::info
	 * if the returned filename is conflicting with an existing filename, this method will be invoked repeatedly
	 * with a third argument until conflict resolves
	 * :::
	 */
	createSourceName(ctx: RequestContext, originalName: string, conflictName?: string): string;

	/**
	 * @description
	 * Creates a unique name for the preview file.
	 *
	 * :::info
	 * the same conflict resolution mechanism gets applied here as described above
	 * :::
	 */
	createPreviewName(ctx: RequestContext, sourceName: string, conflictName?: string): string;
}
