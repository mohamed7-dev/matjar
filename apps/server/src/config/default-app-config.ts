import { LanguageCode } from '@matjar/common/lib/generated-types';
import {
	ADMIN_API_PATH,
	DEFAULT_COMPANY_IDENTIFIER,
	DEFAULT_MARKETPLACE_REGION_IDENTIFIER,
	DEFAULT_MARKETPLACE_REGION_TOKEN,
	DEFAULT_SUPER_ADMIN_IDENTIFIER,
	DEFAULT_SUPER_ADMIN_PASSWORD,
	STORE_API_PATH,
} from '@matjar/common/lib/shared-constants';
import { DefaultAssetNamingStrategy } from './strategies/asset/default-asset-naming.strategy';
import { LocalAssetPreviewStrategy } from './strategies/asset/local-asset-preview.strategy';
import { LocalAssetStorageStrategy } from './strategies/asset/local-asset-storage.strategy';
import { BcryptPasswordHashingStrategy } from './strategies/auth/bcrypt-password-hashing.strategy';
import { DefaultSessionCacheStrategy } from './strategies/auth/default-session-cache.strategy';
import { NativeAuthStrategy } from './strategies/auth/native-auth.strategy';
import { InMemoryCacheStrategy } from './strategies/cache/in-memory-cache.strategy';
import { StdoutLoggerStrategy } from './strategies/logger/stdout-logger.strategy';
import { RuntimeAppConfig } from './types/app-config.interface';

export const appConfig: RuntimeAppConfig = {
	defaultLanguageCode: LanguageCode.en,
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
		companyIdentifier: DEFAULT_COMPANY_IDENTIFIER,
	},
	database: {
		type: 'postgres',
		synchronize: false,
	},
	auth: {
		requireVerification: true,
		authTokenHeader: 'x-session-token',
		sessionDuration: '1y',
		sessionCacheTTL: 300,
		superAdminCredentials: {
			identifier: DEFAULT_SUPER_ADMIN_IDENTIFIER,
			password: DEFAULT_SUPER_ADMIN_PASSWORD,
		},
		passwordHashingStrategy: new BcryptPasswordHashingStrategy(),
		adminAuthenticationStrategies: [
			new NativeAuthStrategy(),
		],
		storeAuthenticationStrategies: [
			new NativeAuthStrategy(),
		],
		sessionCacheStrategy: new DefaultSessionCacheStrategy(),
	},
	asset: {
		maxUploadSizeInBytes: 20971520,
		allowedFileTypes: [
			'image/*',
			'video/*',
			'audio/*',
			'.pdf',
		],
		assetStorageStrategy: new LocalAssetStorageStrategy(),
		assetNamingStrategy: new DefaultAssetNamingStrategy(),
		assetPreviewStrategy: new LocalAssetPreviewStrategy(),
	},
};
