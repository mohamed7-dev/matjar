import { LanguageCode } from '@matjar/common/lib/generated-types';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DataSourceOptions } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
import { AssetNamingStrategy } from '../strategies/asset/asset-naming-strategy.interface';
import { AssetPreviewStrategy } from '../strategies/asset/asset-preview-strategy.interface';
import { AssetStorageStrategy } from '../strategies/asset/asset-storage-strategy.interface';
import { AuthenticationStrategy } from '../strategies/auth/authentication-strategy.interface';
import { PasswordHashingStrategy } from '../strategies/auth/password-hashing-strategy.interface';
import { SessionCacheStrategy } from '../strategies/auth/session-cache-strategy.interface';
import { CacheStrategy } from '../strategies/cache/cache-strategy.interface';
import { LoggerStrategy } from '../strategies/logger/logger-strategy.interface';

interface SystemConfigOptions {
	loggerStrategy?: LoggerStrategy;
	cacheStrategy?: CacheStrategy;
}

interface ApiActorOptions {
	path?: string;
	enableDebugging?: boolean;
	enablePlayground?: boolean;
	listQueryLimit?: number;
}

interface ApiConfigOptions {
	port?: number;
	host?: string;
	enableIntrospection?: boolean;
	admin?: ApiActorOptions;
	store?: ApiActorOptions;
	/**
	 * @description
	 * The property name that identifies the marketplace region in the header object
	 */
	marketplaceRegionIdentifier?: string;
	/**
	 * @description
	 * The property name that identifies the company in the header object
	 */
	companyIdentifier?: string;
	cors?: CorsOptions;
}

type DatabaseConfigOptions = DataSourceOptions;

export interface SuperAdminCredentials {
	identifier: string;
	password: string;
}

export interface AuthConfigOptions {
	sessionDuration?: string | number;
	sessionCacheTTL?: number | string;
	requireVerification?: boolean;
	authTokenHeader?: string;
	superAdminCredentials?: Partial<SuperAdminCredentials>;
	passwordHashingStrategy?: PasswordHashingStrategy;
	adminAuthenticationStrategies?: Array<AuthenticationStrategy>;
	storeAuthenticationStrategies?: Array<AuthenticationStrategy>;
	sessionCacheStrategy?: SessionCacheStrategy;
}

export interface AssetConfigOptions {
	/**
	 * @default 20 mb
	 */
	maxUploadSizeInBytes?: number;
	/**
	 * @description
	 * This should be in the form of either a file extension (".png") or a mime type ("image/*")
	 * @default image, audio, video, PDF MIME types
	 */
	allowedFileTypes?: string[];
	assetStorageStrategy?: AssetStorageStrategy;
	assetPreviewStrategy?: AssetPreviewStrategy;
	assetNamingStrategy?: AssetNamingStrategy;
}

export interface AppConfig {
	defaultLanguageCode?: LanguageCode;
	defaultMarketplaceRegionToken?: string;
	system?: SystemConfigOptions;
	api?: ApiConfigOptions;
	database?: DatabaseConfigOptions;
	auth?: AuthConfigOptions;
	asset?: AssetConfigOptions;
}

export interface RuntimeAppConfig extends Required<AppConfig> {
	system: Required<SystemConfigOptions>;
	api: Required<ApiConfigOptions> & {
		admin: Required<ApiActorOptions>;
		store: Required<ApiActorOptions>;
	};
	auth: Required<AuthConfigOptions> & {
		superAdminCredentials: Required<SuperAdminCredentials>;
	};
	asset: Required<AssetConfigOptions>;
}

export type PartialAppConfig = DeepPartial<AppConfig>;
