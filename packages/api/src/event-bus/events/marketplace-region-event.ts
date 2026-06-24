import {
	CreateMarketplaceRegionInput,
	UpdateMarketplaceRegionInput,
} from '@matjar/common/lib/generated-types';
import { RequestContext } from '../../api/request-context/request-context';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type MarketplaceRegionEventInput = string | CreateMarketplaceRegionInput | UpdateMarketplaceRegionInput;

export class MarketplaceRegionEvent extends AppEntityEvent<MarketplaceRegion, MarketplaceRegionEventInput> {
	constructor(
		ctx: RequestContext,
		entity: MarketplaceRegion,
		type: AppEntityEventType,
		input?: MarketplaceRegionEventInput,
	) {
		super(ctx, entity, type, input);
	}
}
