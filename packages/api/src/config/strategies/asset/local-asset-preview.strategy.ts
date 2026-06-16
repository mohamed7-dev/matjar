import { RequestContext } from '../../../api/request-context/request-context';
import { AssetPreviewStrategy } from './asset-preview-strategy.interface';

export class LocalAssetPreviewStrategy implements AssetPreviewStrategy {
	async generatePreviewImage(_ctx: RequestContext, _mimeType: string, buffer: Buffer): Promise<Buffer> {
		// simple local preview endpoint
		return buffer as Buffer;
	}
}
