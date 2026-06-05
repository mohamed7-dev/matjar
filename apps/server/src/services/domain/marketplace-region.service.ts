import { CurrencyCode } from '@matjar/common/lib/generated-types';
import { DEFAULT_MARKETPLACE_REGION_CODE } from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError, MarketplaceRegionNotFoundError } from '../../common/errors/errors';
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

	/**
	 * @description
	 * Retrieves marketplace region by the given token.
	 *
	 * :::warning
	 * throws {@link MarketplaceRegionNotFoundError} error if marketplace region isn't found
	 * :::
	 */
	async getMarketplaceRegionByToken(token: string): Promise<MarketplaceRegion>;
	async getMarketplaceRegionByToken(ctx: RequestContext, token: string): Promise<MarketplaceRegion>;
	public async getMarketplaceRegionByToken(
		ctxOrToken: RequestContext | string,
		maybeToken?: string,
	): Promise<MarketplaceRegion> {
		const token = !(ctxOrToken instanceof RequestContext) ? ctxOrToken : maybeToken;
		const ctx = ctxOrToken instanceof RequestContext ? ctxOrToken : undefined;

		if (!token) {
			return await this.getDefaultMarketplaceRegion(ctx);
		}

		let marketplaceRegion: MarketplaceRegion | null;

		if (!ctx) {
			marketplaceRegion = await this.ormService.dataSource.getRepository(MarketplaceRegion).findOne({
				where: {
					token: token,
				},
			});
		} else {
			marketplaceRegion = await this.ormService.getRepository(ctx, MarketplaceRegion).findOne({
				where: {
					token: token,
				},
			});
		}

		if (!marketplaceRegion) {
			throw new MarketplaceRegionNotFoundError(token);
		}

		return marketplaceRegion;
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
				primaryCurrencyCode: CurrencyCode.USD,
				availableCurrencyCodes: [
					CurrencyCode.USD,
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
