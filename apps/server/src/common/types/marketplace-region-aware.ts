import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';

export interface MarketplaceRegionAware {
	marketplaceRegions: MarketplaceRegion[];
}
