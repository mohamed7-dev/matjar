import { RequestContext } from '../../api/request-context/request-context';
import { AppEntity } from '../../common/helpers/app-entity';
import { ClassType } from '../../common/types/class-type';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { AppEvent } from '../app-event';

export class ChangeMarketplaceRegionEvent<
	Entity extends AppEntity & MarketplaceRegionAware,
> extends AppEvent {
	constructor(
		public ctx: RequestContext,
		public entity: Entity,
		public marketplaceRegionIds: string[],
		public type: 'assigned' | 'removed',
		public entityType?: ClassType<Entity>,
	) {
		super();
	}
}
