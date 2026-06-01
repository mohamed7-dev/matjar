import { DEFAULT_MARKETPLACE_REGION_CODE } from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError } from '../../common/errors/errors';
import { ConfigService } from '../../config/config.service';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { OrmService } from '../../orm/orm.service';

@Injectable()
export class MarketplaceRegionService {
	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
	) {}

	/**@internal */
	public async initMarketplaceRegions(): Promise<void> {
		await this.initializeDefaultMarketplaceRegion();
	}

	public async getDefaultMarketplaceRegion(ctx?: RequestContext): Promise<MarketplaceRegion> {
		// sometimes we don't have the marketplace region token (e.g. when request comes with no token)
		// so we use code as the main query prop
		let defaultMarketplaceRegion: MarketplaceRegion | null;
		if (ctx) {
			defaultMarketplaceRegion = await this.ormService.getRepository(ctx, MarketplaceRegion).findOne({
				where: {
					code: DEFAULT_MARKETPLACE_REGION_CODE,
				},
			});
		} else {
			defaultMarketplaceRegion = await this.ormService.dataSource
				.getRepository(MarketplaceRegion)
				.findOne({
					where: {
						code: DEFAULT_MARKETPLACE_REGION_CODE,
					},
				});
		}

		if (!defaultMarketplaceRegion) {
			throw new InternalServerError('errors.default_marketplace_region_not_found');
		}
		return defaultMarketplaceRegion;
	}

	private async initializeDefaultMarketplaceRegion(): Promise<void> {
		const { defaultMarketplaceRegionToken } = this.configService;

		let defaultMarketplaceRegion = await this.ormService.dataSource
			.getRepository(MarketplaceRegion)
			.findOne({
				where: {
					code: DEFAULT_MARKETPLACE_REGION_CODE,
				},
			});

		if (defaultMarketplaceRegion && defaultMarketplaceRegion.token !== defaultMarketplaceRegionToken) {
			defaultMarketplaceRegion.token = defaultMarketplaceRegionToken;
		} else {
			defaultMarketplaceRegion = new MarketplaceRegion({
				code: DEFAULT_MARKETPLACE_REGION_CODE,
				token: defaultMarketplaceRegionToken,
				primaryCurrencyCode: 'USD', // TODO: change
				availableCurrencyCodes: [
					'USD',
				],
				primaryLanguageCode: this.configService.defaultLanguageCode,
				availableLanguageCodes: [
					this.configService.defaultLanguageCode,
				],
			});
		}

		await this.ormService.dataSource.getRepository(MarketplaceRegion).save(defaultMarketplaceRegion, {
			reload: false,
		});
	}
}
