import {
	ADMIN_API_PATH,
	DEFAULT_MARKETPLACE_REGION_IDENTIFIER,
	DEFAULT_MARKETPLACE_REGION_TOKEN,
	DEFAULT_SUPER_ADMIN_IDENTIFIER,
	DEFAULT_SUPER_ADMIN_PASSWORD,
	STORE_API_PATH,
} from '@matjar/common/lib/shared-constants';
import { InMemoryCacheStrategy } from './strategies/cache/in-memory-cache.strategy';
import { StdoutLoggerStrategy } from './strategies/logger/stdout-logger.strategy';
import { RuntimeAppConfig } from './types/app-config.interface';

export const appConfig: RuntimeAppConfig = {
	defaultLanguageCode: 'en',
	defaultMarketplaceRegionToken: DEFAULT_MARKETPLACE_REGION_TOKEN,
	system: {
		loggerStrategy: new StdoutLoggerStrategy(),
		cacheStrategy: new InMemoryCacheStrategy(),
	},
	api: {
		port: 3000,
		host: 'localhost',
		enableIntrospection: false,
		admin: {
			path: ADMIN_API_PATH,
			enableDebugging: true,
			enablePlayground: true,
		},
		store: {
			path: STORE_API_PATH,
			enableDebugging: true,
			enablePlayground: true,
		},
		marketplaceRegionIdentifier: DEFAULT_MARKETPLACE_REGION_IDENTIFIER,
	},
	database: {
		type: 'postgres',
		synchronize: false,
	},
	auth: {
		superAdminCredentials: {
			identifier: DEFAULT_SUPER_ADMIN_IDENTIFIER,
			password: DEFAULT_SUPER_ADMIN_PASSWORD,
		},
	},
};
