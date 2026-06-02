import { CurrencyCode, LanguageCode } from '@matjar/common/lib/generated-types';
import { CURRENCY_CODE_QUERY_NAME, LANGUAGE_CODE_QUERY_NAME } from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { RequestContext } from '../../api/request-context/request-context';
import { ApiType, getApiType } from '../../api/utils/get-api-type';
import { ConfigService } from '../../config/config.service';

interface BuildFromRequestOptions {
	req: Request;
	graphqlResolveInfo: GraphQLResolveInfo;
}

@Injectable()
export class RequestContextService {
	constructor(private readonly configService: ConfigService) {}

	public create(options: {
		apiType: ApiType;
		languageCode?: string;
		currencyCode?: string;
		req?: Request;
	}): RequestContext {
		const { languageCode, currencyCode, req, apiType } = options;
		return new RequestContext({
			languageCode,
			currencyCode,
			req,
			apiType,
		});
	}

	public buildFromRequest({ req, graphqlResolveInfo }: BuildFromRequestOptions): RequestContext {
		const languageCode = this.extractLanguageCode(req);
		const currencyCode = this.extractCurrencyCode(req);
		const apiType = getApiType(graphqlResolveInfo);
		return new RequestContext({
			languageCode,
			currencyCode,
			req,
			apiType,
			tFunction: req.t,
		});
	}

	private extractLanguageCode(req: Request): LanguageCode {
		// 1. query param
		// 2. sales channel default language
		// 3. config default language

		if (req?.query?.[LANGUAGE_CODE_QUERY_NAME]) {
			return req.query[LANGUAGE_CODE_QUERY_NAME] as LanguageCode;
		}

		return this.configService.defaultLanguageCode;
	}

	private extractCurrencyCode(req: Request): CurrencyCode {
		// 1. query param
		// 2. sales channel available currencies

		if (req?.query?.[CURRENCY_CODE_QUERY_NAME]) {
			const queryCurrencyCode = req.query[CURRENCY_CODE_QUERY_NAME] as CurrencyCode;
			// TODO: check if queryCurrencyCode is available in the sales channel
			// and throw error if not
			return queryCurrencyCode;
		}

		return CurrencyCode.USD; // this should return the defaultCurrencyCode of the channel
	}
}
