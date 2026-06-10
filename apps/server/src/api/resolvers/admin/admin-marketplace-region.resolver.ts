import { Permission, QueryMarketplaceRegionsArgs } from '@matjar/common/lib/generated-types';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { PaginatedList } from '../../../common/types/paginated-list';
import { MarketplaceRegion } from '../../../entities/marketplace-region/marketplace-region.entity';
import { MarketplaceRegionService } from '../../../services/domain/marketplace-region.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver()
export class AdminMarketplaceRegionResolver {
	constructor(private readonly marketplaceRegionService: MarketplaceRegionService) {}

	@Query('activeMarketplaceRegion')
	@Access({
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async activeMarketplaceRegion(@Ctx() ctx: RequestContext): Promise<MarketplaceRegion> {
		return ctx.marketplaceRegion;
	}

	@Query('marketplaceRegions')
	@Access({
		permissions: [
			// Permission.settings_read,
			Permission.platform_marketplace_region_read,
		],
	})
	public async marketplaceRegions(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryMarketplaceRegionsArgs,
	): Promise<PaginatedList<MarketplaceRegion>> {
		return await this.marketplaceRegionService.findAll(ctx, args.options ?? ({} as any));
	}
}
