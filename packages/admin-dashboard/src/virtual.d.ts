declare module 'virtual:app-config' {
	import type { AppConfig } from '@matjar/api';

	export const appConfig: AppConfig;
}

declare module 'virtual:admin-dashboard-ui-config' {
	import type { RuntimeUiConfig } from '../vite-plugins/vite-ui-config-plugin';
	export const uiConfig: RuntimeUiConfig;
}

declare module 'virtual:gql-schema-info' {
	import type { SchemaInfo } from '../vite-plugins/vite-gql-schema-info-plugin.js';
	export const schemaInfo: SchemaInfo;
}
