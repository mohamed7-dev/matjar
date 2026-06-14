import { RequestContext } from '../../api/request-context/request-context';
import { Asset } from '../../entities/asset/asset.entity';
import { AppEvent } from '../app-event';

export class AssetMarketplaceEvent extends AppEvent {
	constructor(
		public ctx: RequestContext,
		public asset: Asset,
		public marketplaceId: string,
		public type: 'assigned' | 'removed',
	) {
		super();
	}
}
