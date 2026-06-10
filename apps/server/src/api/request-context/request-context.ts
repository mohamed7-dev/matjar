import { CurrencyCode, LanguageCode, Permission } from '@matjar/common/lib/generated-types';
import { Request } from 'express';
import { TFunction } from 'i18next';
import { PermissionIndexItemType, PermissionsIndex } from '../../common/helpers/permission-index';
import { SessionCacheEntry } from '../../config/strategies/auth/session-cache-strategy.interface';
import { Company } from '../../entities/company/company.entity';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { ApiType } from '../utils/get-api-type';

interface RequestContextOptions {
	apiType: ApiType;
	languageCode?: LanguageCode;
	currencyCode?: CurrencyCode;
	req?: Request;
	tFunction?: TFunction;
	marketplaceRegion: MarketplaceRegion;
	session?: SessionCacheEntry;
	company?: Company;
}
export class RequestContext {
	private _apiType: ApiType;
	private _languageCode: LanguageCode;
	private _currencyCode: CurrencyCode;
	private _req?: Request;
	private _t: TFunction;
	private _marketplaceRegion: MarketplaceRegion;
	private _session?: SessionCacheEntry;
	private _company?: Company;

	constructor(options: RequestContextOptions) {
		this._apiType = options.apiType;
		this._currencyCode = options.currencyCode ?? options.marketplaceRegion.primaryCurrencyCode;
		this._languageCode = options.languageCode ?? options.marketplaceRegion.primaryLanguageCode;
		this._req = options.req;
		this._t = options.tFunction ?? (((key: string) => key) as any);
		this._marketplaceRegion = options.marketplaceRegion;
		this._session = options.session;
		this._company = options.company;
	}

	get apiType(): ApiType {
		return this._apiType;
	}

	get languageCode(): LanguageCode {
		return this._languageCode;
	}

	get currencyCode(): CurrencyCode {
		return this._currencyCode;
	}

	get req(): Request | undefined {
		return this._req;
	}

	get marketplaceRegion(): MarketplaceRegion {
		return this._marketplaceRegion;
	}

	get marketplaceRegionId(): string {
		return this.marketplaceRegion.id;
	}

	get company(): Company | undefined {
		return this._company;
	}

	get companyId(): string | undefined {
		return this.company?.id;
	}

	get session(): SessionCacheEntry | undefined {
		return this._session;
	}

	get activeUserId(): string | undefined {
		return this.session?.user.id;
	}

	public t(key: string, variables?: Record<string, any>): string {
		try {
			return this._t(key, variables);
		} catch (error) {
			return `([TranslationFormatError]: ${JSON.stringify((error as Error).message)}). OriginalKey: ${key}`;
		}
	}

	public hasAnyPermission(perms: Permission[]): boolean {
		if (this.session?.user.permissionsIndex) {
			return PermissionsIndex.has(
				this.session?.user.permissionsIndex,
				{
					type: this.companyId ? PermissionIndexItemType.COMPANY : PermissionIndexItemType.PLATFORM,
					companyId: this.companyId,
					marketplaceRegionId: this.marketplaceRegionId,
				},
				perms,
			);
		}
		return false;
	}

	public hasAllPermissions(perms: Permission[]): boolean {
		if (this.session?.user.permissionsIndex) {
			return PermissionsIndex.hasAll(
				this.session?.user.permissionsIndex,
				{
					type: this.companyId ? PermissionIndexItemType.COMPANY : PermissionIndexItemType.PLATFORM,
					companyId: this.companyId,
					marketplaceRegionId: this.marketplaceRegionId,
				},
				perms,
			);
		}
		return false;
	}
}
