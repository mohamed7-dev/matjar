import { PartialAppConfig, RuntimeAppConfig } from '../types/app-config.interface';
import { mergeConfig } from './merge-config';

export class AppConfigUtils {
	private static _appConfig: RuntimeAppConfig;

	static setConfig(userConfig?: PartialAppConfig): void {
		if (!AppConfigUtils._appConfig) {
			AppConfigUtils.setDefaultAppConfig();
		}
		if (userConfig) {
			AppConfigUtils._appConfig = mergeConfig(userConfig, AppConfigUtils._appConfig);
		}
	}

	static getConfig(): RuntimeAppConfig {
		if (!AppConfigUtils._appConfig) {
			try {
				AppConfigUtils.setDefaultAppConfig();
			} catch {
				console.error(
					"[AppConfig]: config can't be loaded, make sure to call `AppConfigUtils.cacheConfig()` method before running this method.",
				);
			}
		}
		return AppConfigUtils._appConfig;
	}

	static cacheConfig(): RuntimeAppConfig {
		AppConfigUtils.setDefaultAppConfig();
		return AppConfigUtils._appConfig;
	}

	static resetConfig(): void {
		AppConfigUtils.setDefaultAppConfig();
	}

	private static setDefaultAppConfig(): void {
		AppConfigUtils._appConfig = require('../default-app-config').appConfig;
	}
}
