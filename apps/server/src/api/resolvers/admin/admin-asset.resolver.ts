import { MutationCreateAssetsArgs, Permission } from '@matjar/common/lib/generated-types';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InvalidMimetypeError } from '../../../common/errors/generated-graphql-admin-errors';
import { Translated } from '../../../common/types/translatable';
import { Asset } from '../../../entities/asset/asset.entity';
import { AssetService } from '../../../services/domain/asset.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver()
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
}
