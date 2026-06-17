import {
	DeletionResponse,
	MutationAssignAssetsToMarketplaceArgs,
	MutationCreateAssetsArgs,
	MutationDeleteAssetArgs,
	MutationDeleteAssetsArgs,
	MutationUpdateAssetArgs,
	Permission,
	QueryAssetArgs,
	QueryAssetsArgs,
} from '@matjar/common/lib/generated-types';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InvalidMimetypeError } from '../../../common/errors/generated-graphql-admin-errors';
import { PaginatedList } from '../../../common/types/paginated-list';
import { Translated } from '../../../common/types/translatable';
import { Asset } from '../../../entities/asset/asset.entity';
import { AssetService } from '../../../services/domain/asset.service';
import { UserHasPermissionOnMarketplacePolicyOptions } from '../../access-policies/user-has-permission-on-marketplace.policy';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RelationPaths, Relations } from '../../decorators/relations.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver('Asset')
export class AdminAssetResolver {
	constructor(private readonly assetService: AssetService) {}

	@Mutation('createAssets')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_asset_create,
			Permission.platform_catalog_create,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async create(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationCreateAssetsArgs,
	): Promise<Array<Translated<Asset> | InvalidMimetypeError>> {
		const assets: Array<Translated<Asset> | InvalidMimetypeError> = [];
		for (const input of args.input) {
			const asset = await this.assetService.create(ctx, input);
			assets.push(asset);
		}

		return assets;
	}

	@Mutation('updateAsset')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_catalog_update,
			Permission.platform_asset_update,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async update(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationUpdateAssetArgs,
	): Promise<Translated<Asset>> {
		return await this.assetService.update(ctx, args.input);
	}

	@Mutation('deleteAssets')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_catalog_delete,
			Permission.platform_asset_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async deleteBulk(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteAssetsArgs,
	): Promise<DeletionResponse> {
		return await this.assetService.delete(ctx, args.input.ids, {
			force: args.input.force || undefined,
			deleteFromAllMarketplaces: args.input.deleteFromAllMarketplaces || undefined,
		});
	}

	@Mutation('deleteAsset')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_catalog_delete,
			Permission.platform_asset_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async delete(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteAssetArgs,
	): Promise<DeletionResponse> {
		return await this.assetService.delete(
			ctx,
			[
				args.input.id,
			],
			{
				force: args.input.force || undefined,
				deleteFromAllMarketplaces: args.input.deleteFromAllMarketplaces || undefined,
			},
		);
	}

	@Mutation('assignAssetsToMarketplace')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_catalog_update,
			Permission.platform_asset_update,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
			{
				name: 'UserHasPermissionOnMarketplacePolicy',
				options: {
					permission: Permission.platform_catalog_update,
					gqlMarketplaceIdArgsPath: 'input.marketplaceId',
				} satisfies UserHasPermissionOnMarketplacePolicyOptions,
			},
		],
	})
	public async assignToMarketplace(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationAssignAssetsToMarketplaceArgs,
	): Promise<Array<Translated<Asset>>> {
		return await this.assetService.assignToMarketplaceRegion(ctx, args.input);
	}

	@Query('asset')
	@Access({
		permissions: [
			Permission.platform_catalog_read,
			Permission.platform_asset_read,
		],
	})
	public async findOne(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryAssetArgs,
		@Relations(Asset) relations: RelationPaths<Asset>,
	): Promise<Asset | undefined> {
		return await this.assetService.findOne(ctx, args.id, relations);
	}

	@Query('assets')
	@Access({
		permissions: [
			Permission.platform_catalog_read,
			Permission.platform_asset_read,
		],
	})
	public async find(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryAssetsArgs,
		@Relations(Asset) relations: RelationPaths<Asset>,
	): Promise<PaginatedList<Translated<Asset>>> {
		return await this.assetService.find(ctx, args.options || undefined, relations);
	}
}
