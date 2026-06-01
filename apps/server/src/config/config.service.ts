import { Injectable } from '@nestjs/common';
import { RuntimeAppConfig } from './types/app-config.interface';
import { AppConfigUtils } from './utils/config-utils';

@Injectable()
export class ConfigService {
	private appConfig: RuntimeAppConfig;
	constructor() {
		this.appConfig = AppConfigUtils.getConfig();
	}

	get system(): RuntimeAppConfig['system'] {
		return this.appConfig.system;
	}

	get api(): RuntimeAppConfig['api'] {
		return this.appConfig.api;
	}

	get database(): RuntimeAppConfig['database'] {
		return this.appConfig.database;
	}

	get auth(): RuntimeAppConfig['auth'] {
		return this.appConfig.auth;
	}

	get defaultLanguageCode(): RuntimeAppConfig['defaultLanguageCode'] {
		return this.appConfig.defaultLanguageCode;
	}

	get defaultMarketplaceRegionToken(): RuntimeAppConfig['defaultMarketplaceRegionToken'] {
		return this.appConfig.defaultMarketplaceRegionToken;
	}
}
