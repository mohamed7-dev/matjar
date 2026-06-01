import { assignToObject } from '../../common/utils/assign-to-object';
import { isClassInstance, isObject } from '../../common/utils/data-type-checkers';
import { PartialAppConfig, RuntimeAppConfig } from '../types/app-config.interface';

export class AppConfigUtils {
	private static _appConfig: RuntimeAppConfig;

	static setConfig(userConfig?: PartialAppConfig): void {
		if (!AppConfigUtils._appConfig) {
			AppConfigUtils._appConfig = require('../default-app-config').appConfig;
		}
		if (userConfig) {
			AppConfigUtils._appConfig = AppConfigUtils.mergeConfig(userConfig, AppConfigUtils._appConfig);
		}
	}

	static getConfig(): RuntimeAppConfig {
		if (!AppConfigUtils._appConfig) {
			try {
				AppConfigUtils._appConfig = require('../default-app-config').appConfig;
			} catch {
				console.error(
					"[AppConfig]: config can't be loaded, make sure to call `AppAppConfigUtils.cacheConfig()` method before running this method.",
				);
			}
		}
		return AppConfigUtils._appConfig;
	}

	static cacheConfig(): RuntimeAppConfig {
		AppConfigUtils._appConfig = require('../default-app-config').appConfig;
		return AppConfigUtils._appConfig;
	}

	static resetConfig(): void {
		AppConfigUtils._appConfig = require('../default-app-config').appConfig;
	}

	private static mergeConfig(
		src: PartialAppConfig,
		dest: RuntimeAppConfig,
		depth: number = 0,
	): RuntimeAppConfig {
		if (!src) return dest;

		if (isObject(src) && isObject(dest)) {
			for (const key in src) {
				const srcTypedKey = key as keyof typeof src;
				const srcValue = src[srcTypedKey];
				if (isObject(srcValue)) {
					// object has three possibilities:
					// 1. class constructor
					// 2. plain object
					// 3. value exists in src, but not in dest
					const destValue = dest[srcTypedKey];
					if (!destValue) {
						// value doesn't exist in dest -> init
						assignToObject(dest, srcTypedKey, {});
					}
					if (isClassInstance(srcValue)) {
						// constructor -> assign directly to dest
						assignToObject(dest, srcTypedKey, srcValue);
					} else {
						// plain object -> run recursively
						AppConfigUtils.mergeConfig(
							srcValue as unknown as PartialAppConfig,
							dest[srcTypedKey] as unknown as RuntimeAppConfig,
							depth + 1,
						);
					}
				} else {
					// primitive -> assign directly to dest
					assignToObject(dest, srcTypedKey, srcValue);
				}
			}
		}

		return dest;
	}
}
