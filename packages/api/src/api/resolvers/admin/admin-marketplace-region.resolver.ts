import {
	DeletionResponse,
	MutationCreateMarketplaceRegionArgs,
	MutationDeleteMarketplaceRegionArgs,
	MutationDeleteMarketplaceRegionsArgs,
	MutationUpdateMarketplaceRegionArgs,
	Permission,
	QueryMarketplaceRegionArgs,
	QueryMarketplaceRegionsArgs,
} from '@matjar/common/lib/generated-types';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginatedList } from '../../../common/types/paginated-list';
import { MarketplaceRegion } from '../../../entities/marketplace-region/marketplace-region.entity';
import { Role } from '../../../entities/role/role.entity';
import { MarketplaceRegionService } from '../../../services/domain/marketplace-region.service';
import { RoleService } from '../../../services/domain/role.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver()
export class AdminMarketplaceRegionResolver {
	constructor(
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly roleService: RoleService,
	) {}

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
			Permission.platform_marketplace_region_read,
		],
	})
	public async marketplaceRegions(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryMarketplaceRegionsArgs,
	): Promise<PaginatedList<MarketplaceRegion>> {
		return await this.marketplaceRegionService.findAll(ctx, args.options ?? ({} as any));
	}

	@Query('marketplaceRegion')
	@Access({
		permissions: [
			Permission.platform_marketplace_region_read,
		],
	})
	public async marketplaceRegion(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryMarketplaceRegionArgs,
	): Promise<MarketplaceRegion | undefined> {
		return await this.marketplaceRegionService.findOne(ctx, args.id);
	}

	@Mutation('createMarketplaceRegion')
	@Access({
		permissions: [
			Permission.platform_super_admin,
		],
	})
	public async create(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationCreateMarketplaceRegionArgs,
	): Promise<MarketplaceRegion> {
		const result = await this.marketplaceRegionService.createMarketplaceRegion(ctx, args.input);

		const superAdminRole = await this.roleService.getSuperAdminRole(ctx);
		const customerRole = await this.roleService.getCustomerRole(ctx);
		const companyAdminRole = await this.roleService.getCompanyAdminRole(ctx);

		await this.marketplaceRegionService.assignToMarketplaceRegions(ctx, Role, superAdminRole.id, [
			result.id,
		]);
		await this.marketplaceRegionService.assignToMarketplaceRegions(ctx, Role, customerRole.id, [
			result.id,
		]);
		await this.marketplaceRegionService.assignToMarketplaceRegions(ctx, Role, companyAdminRole.id, [
			result.id,
		]);
		return result;
	}

	@Mutation('updateMarketplaceRegion')
	@Access({
		permissions: [
			Permission.platform_super_admin,
		],
	})
	public async update(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationUpdateMarketplaceRegionArgs,
	): Promise<MarketplaceRegion> {
		return await this.marketplaceRegionService.updateMarketplaceRegion(ctx, args.input);
	}

	@Mutation('deleteMarketplaceRegion')
	@Access({
		permissions: [
			Permission.platform_super_admin,
		],
	})
	public async delete(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteMarketplaceRegionArgs,
	): Promise<DeletionResponse> {
		return await this.marketplaceRegionService
			.deleteMarketplaceRegions(ctx, [
				args.id,
			])
			.then((deletionResponses) => deletionResponses[0]);
	}

	@Mutation('deleteMarketplaceRegions')
	@Access({
		permissions: [
			Permission.platform_super_admin,
		],
	})
	public async deleteMany(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteMarketplaceRegionsArgs,
	): Promise<DeletionResponse[]> {
		return await this.marketplaceRegionService.deleteMarketplaceRegions(ctx, args.ids);
	}
}
