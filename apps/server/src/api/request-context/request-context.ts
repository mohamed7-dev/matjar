import { Request } from 'express';
import { TFunction } from 'i18next';
import { ApiType } from '../utils/get-api-type';

interface RequestContextOptions {
	apiType: ApiType;
	languageCode?: string;
	currencyCode?: string;
	req?: Request;
	tFunction?: TFunction;
}
export class RequestContext {
	private _apiType: ApiType;
	private _languageCode: string;
	private _currencyCode: string;
	private _req?: Request;
	private _t: TFunction;

	constructor(options: RequestContextOptions) {
		this._apiType = options.apiType;
		this._currencyCode = options.currencyCode ?? 'USD'; // Should be the default of the channel
		this._languageCode = options.languageCode ?? 'en'; // should be the default of the channel
		this._req = options.req;
		this._t = options.tFunction ?? (((key: string) => key) as any);
	}

	get apiType(): ApiType {
		return this._apiType;
	}

	get languageCode(): string {
		return this._languageCode;
	}

	get currencyCode(): string {
		return this._currencyCode;
	}

	get req(): Request | undefined {
		return this._req;
	}

	public t(key: string, variables?: Record<string, any>): string {
		try {
			return this._t(key, variables);
		} catch (error) {
			return `([TranslationFormatError]: ${JSON.stringify((error as Error).message)}). OriginalKey: ${key}`;
		}
	}
}
