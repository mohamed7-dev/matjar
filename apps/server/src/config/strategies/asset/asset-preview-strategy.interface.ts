import { RequestContext } from '../../../api/request-context/request-context';
import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy';

export interface AssetPreviewStrategy extends LifecycleStrategy {
	/**
	 * @description
	 * Generate a preview image from file data.
	 *
	 * :::info
	 * For Images, preview images should be resized to a sensible dimensions,
	 * For PDF documents, preview images should be generated,
	 * For Video, thumbnail images should be generated
	 * :::
	 */
	generatePreviewImage(ctx: RequestContext, mimeType: string, buffer: Buffer): Promise<Buffer>;
}
