declare module 'virtual:app-config' {
	import type { AppConfig } from '@matjar/server';

	export const appConfig: AppConfig;
}

declare module 'virtual:admin-dashboard-ui-config' {
	import type { RuntimeUiConfig } from '../vite-plugins/vite-ui-config-plugin';
	export const uiConfig: RuntimeUiConfig;
}
