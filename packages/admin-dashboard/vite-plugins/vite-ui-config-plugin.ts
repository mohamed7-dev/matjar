import type { AppConfig } from '@matjar/api';
import type { LanguageCode } from '@matjar/common/lib/generated-types';
import {
	ADMIN_API_PATH,
	DEFAULT_AUTH_TOKEN_HEADER_KEY,
	DEFAULT_MARKETPLACE_REGION_IDENTIFIER,
} from '@matjar/common/lib/shared-constants';
import type { PluginOption } from 'vite';
import {
	DEFAULT_AVAILABLE_LANGUAGE_CODES,
	DEFAULT_AVAILABLE_LOCALES,
	DEFAULT_LANGUAGE,
	DEFAULT_LOCALE,
} from './constants.js';
import { type ConfigLoaderApi, getConfigLoaderApi } from './vite-app-config-loader-plugin.js';

const virtualModuleId = 'virtual:admin-dashboard-ui-config';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

/**
 * @description
 * API connection settings used by the dashboard to communicate with a backend service.
 *
 * These values define how the UI constructs requests to the server API.
 * If set to `"auto"`, values are inferred from the current browser location.
 */
export interface ApiConfig {
	/** Server hostname (e.g. "localhost" or "api.example.com") */
	host?: string | 'auto';

	/** Server port (e.g. 3000). If "auto", uses current location port */
	port?: number | 'auto';

	/** Path to the GraphQL API endpoint */
	adminApiPath?: string;

	/** Header name used to identify the active marketplace region */
	marketplaceRegionIdentifier?: string;

	/** Header name of the session token */
	authTokenHeaderKey?: string;
}

/**
 * @description
 * Internationalization settings for the dashboard UI.
 *
 * Controls language selection and locale-based formatting (dates, currency, etc).
 */
export interface I18nConfig {
	/** Default UI language */
	defaultLanguage?: LanguageCode;

	/** Default locale for formatting numbers, dates, and currency */
	defaultLocale?: string;

	/** List of supported UI languages */
	availableLanguages?: LanguageCode[];

	/** List of supported locales */
	availableLocales?: string[];
}

/**
 * @description
 * Top-level configuration for the dashboard UI plugin.
 *
 * Combines API connection settings and UI localization settings.
 */
export interface UiConfigPluginOptions {
	/** Settings for connecting to the backend API */
	api?: ApiConfig;

	/** Settings for language and localization */
	i18n?: I18nConfig;
}

/**
 * @description
 * Fully resolved configuration used at runtime.
 *
 * All defaults are applied and optional fields are normalized.
 */
export interface RuntimeUiConfig {
	/** Final API configuration with defaults applied */
	api: Required<ApiConfig>;

	/**
	 * Final i18n configuration with defaults applied.
	 * defaultLocale may still be undefined if not provided.
	 */
	i18n: Required<Omit<I18nConfig, 'defaultLocale'>> & Pick<I18nConfig, 'defaultLocale'>;
}

export function viteUiConfigPlugin(options: UiConfigPluginOptions = {}): PluginOption {
	let configLoaderApi: ConfigLoaderApi;
	let appConfig: AppConfig;

	return {
		name: 'matjar:admin-dashboard-ui-config',
		configResolved(config) {
			configLoaderApi = getConfigLoaderApi(config.plugins);
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id) {
			if (id !== resolvedVirtualModuleId) return;

			if (!appConfig) {
				appConfig = await configLoaderApi.getAppConfig();
			}

			const config = getUiConfig(appConfig, options);

			return `export const uiConfig = ${JSON.stringify(config)};`;
		},
	};
}

export function getUiConfig(config: AppConfig, pluginOptions: UiConfigPluginOptions): RuntimeUiConfig {
	const { api: serverApiConfigOptions, auth: serverAuthConfig } = config;

	// Merge
	const api = {
		adminApiPath:
			pluginOptions.api?.adminApiPath ?? serverApiConfigOptions?.admin?.path ?? ADMIN_API_PATH,
		host: pluginOptions.api?.host ?? 'auto',
		port: pluginOptions.api?.port ?? 'auto',
		marketplaceRegionIdentifier:
			pluginOptions.api?.marketplaceRegionIdentifier ??
			serverApiConfigOptions?.marketplaceRegionIdentifier ??
			DEFAULT_MARKETPLACE_REGION_IDENTIFIER,
		authTokenHeaderKey:
			pluginOptions.api?.authTokenHeaderKey ??
			serverAuthConfig?.authTokenHeader ??
			DEFAULT_AUTH_TOKEN_HEADER_KEY,
	};

	// Merge
	const i18n = {
		defaultLanguage: pluginOptions.i18n?.defaultLanguage ?? DEFAULT_LANGUAGE,
		defaultLocale: pluginOptions.i18n?.defaultLocale ?? DEFAULT_LOCALE,
		availableLanguages:
			pluginOptions.i18n?.availableLanguages && pluginOptions.i18n.availableLanguages.length > 0
				? pluginOptions.i18n.availableLanguages
				: DEFAULT_AVAILABLE_LANGUAGE_CODES,
		availableLocales:
			pluginOptions.i18n?.availableLocales && pluginOptions.i18n.availableLocales.length > 0
				? pluginOptions.i18n.availableLocales
				: DEFAULT_AVAILABLE_LOCALES,
	};

	return {
		api,
		i18n,
	};
}
