import { CurrencyCode, LanguageCode } from '@matjar/common/lib/generated-types';
import { CURRENCY_CODE_QUERY_NAME, LANGUAGE_CODE_QUERY_NAME } from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import ms from 'ms';
import { RequestContext } from '../../api/request-context/request-context';
import { ApiType, getApiType } from '../../api/utils/get-api-type';
import { UserInputError } from '../../common/errors/errors';
import { UserPermissionsMap } from '../../common/helpers/user-permissions-map';
import { ConfigService } from '../../config/config.service';
import { SessionCacheEntry } from '../../config/strategies/auth/session-cache-strategy.interface';
import { Company } from '../../entities/company/company.entity';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { User } from '../../entities/user/user.entity';
import { CompanyService } from '../domain/company.service';
import { MarketplaceRegionService } from '../domain/marketplace-region.service';

interface BuildFromRequestOptions {
	req: Request;
	graphqlResolveInfo: GraphQLResolveInfo;
	session?: SessionCacheEntry;
}

interface CreateOptions {
	apiType: ApiType;
	languageCode?: LanguageCode;
	currencyCode?: CurrencyCode;
	req?: Request;
	marketplaceOrToken?: string | MarketplaceRegion;
	companyOrToken?: string | Company;
	user?: User;
	activeOrderId?: string;
}

@Injectable()
export class RequestContextService {
	constructor(
		private readonly configService: ConfigService,
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly companyService: CompanyService,
	) {}

	public async create(options: CreateOptions, dummy: boolean = false): Promise<RequestContext> {
		const {
			languageCode,
			currencyCode,
			req,
			apiType,
			marketplaceOrToken,
			companyOrToken,
			user,
			activeOrderId,
		} = options;

		let marketplaceRegion: MarketplaceRegion;

		if (marketplaceOrToken instanceof MarketplaceRegion) {
			marketplaceRegion = marketplaceOrToken;
		} else if (typeof marketplaceOrToken === 'string') {
			marketplaceRegion =
				await this.marketplaceRegionService.getMarketplaceRegionByToken(marketplaceOrToken);
		} else if (dummy) {
			marketplaceRegion = new MarketplaceRegion();
		} else {
			marketplaceRegion = await this.marketplaceRegionService.getDefaultMarketplaceRegion();
		}

		let company: Company | undefined;

		if (companyOrToken instanceof Company) {
			company = companyOrToken;
		} else if (typeof companyOrToken === 'string') {
			company = await this.companyService.getCompanyByToken(companyOrToken);
		}

		let session: SessionCacheEntry | undefined;

		if (user) {
			const permissionsIndex = user.roles ? UserPermissionsMap.build(user) : UserPermissionsMap.dummy();
			session = {
				user: {
					id: user.id,
					identifier: user.identifier,
					isVerified: user.isVerified,
					userPermissionsMap: permissionsIndex,
				},
				id: '__dummy_session_id__',
				token: '__dummy_session_token__',
				expiresAt: new Date(Date.now() + ms('1y')),
				cacheExpiry: ms('1y'),
				activeOrderId,
			};
		}

		return new RequestContext({
			languageCode,
			currencyCode,
			req,
			apiType,
			marketplaceRegion,
			session,
			company,
		});
	}

	public async buildFromRequest({
		req,
		graphqlResolveInfo,
		session,
	}: BuildFromRequestOptions): Promise<RequestContext> {
		const marketplaceToken = this.getMarketplaceToken(req);
		const companyToken = this.getCompanyToken(req);
		const marketplaceRegion =
			await this.marketplaceRegionService.getMarketplaceRegionByToken(marketplaceToken);
		const languageCode = this.extractLanguageCode(req, marketplaceRegion);
		const currencyCode = this.extractCurrencyCode(req, marketplaceRegion);
		const apiType = getApiType(graphqlResolveInfo);
		const company = await this.companyService.getCompanyByToken(companyToken);
		return new RequestContext({
			languageCode,
			currencyCode,
			req,
			apiType,
			tFunction: req.t,
			marketplaceRegion,
			session,
			company,
		});
	}

	private getMarketplaceToken(req: Request): string {
		const { marketplaceRegionIdentifier } = this.configService.api;

		let token = '';

		if (req?.query?.[marketplaceRegionIdentifier]) {
			token = req.query[marketplaceRegionIdentifier] as string;
		}

		return token;
	}

	private getCompanyToken(req: Request): string {
		const { companyIdentifier } = this.configService.api;

		let token = '';

		if (req?.query?.[companyIdentifier]) {
			token = req.query[companyIdentifier] as string;
		}

		return token;
	}

	private extractLanguageCode(req: Request, marketplaceRegion: MarketplaceRegion): LanguageCode {
		// 1. query param
		// 2. marketplace default language
		// 3. config default language

		if (req?.query?.[LANGUAGE_CODE_QUERY_NAME]) {
			return req.query[LANGUAGE_CODE_QUERY_NAME] as LanguageCode;
		}

		return marketplaceRegion.primaryLanguageCode ?? this.configService.defaultLanguageCode;
	}

	private extractCurrencyCode(req: Request, marketplaceRegion: MarketplaceRegion): CurrencyCode {
		// 1. query param
		// 2. marketplace available currencies

		if (req?.query?.[CURRENCY_CODE_QUERY_NAME]) {
			const queryCurrencyCode = req.query[CURRENCY_CODE_QUERY_NAME] as CurrencyCode;
			if (queryCurrencyCode && !marketplaceRegion.availableCurrencyCodes.includes(queryCurrencyCode)) {
				throw new UserInputError('error.currency_not_available_in_marketplace_region', {
					currencyCode: queryCurrencyCode,
				});
			}
			return queryCurrencyCode;
		}

		return marketplaceRegion.primaryCurrencyCode;
	}
}
