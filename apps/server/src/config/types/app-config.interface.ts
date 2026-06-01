import { DataSourceOptions } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
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
}

type DatabaseConfigOptions = DataSourceOptions;

export interface SuperAdminCredentials {
	identifier: string;
	password: string;
}

export interface AuthConfigOptions {
	superAdminCredentials?: Partial<SuperAdminCredentials>;
}

export interface AppConfig {
	defaultLanguageCode?: string;
	defaultMarketplaceRegionToken?: string;
	system?: SystemConfigOptions;
	api?: ApiConfigOptions;
	database?: DatabaseConfigOptions;
	auth?: AuthConfigOptions;
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
}

export type PartialAppConfig = DeepPartial<AppConfig>;
