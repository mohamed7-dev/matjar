import { uiConfig } from 'virtual:admin-dashboard-ui-config';

export function getApiBaseUrl(): string {
	const schemeAndHost =
		uiConfig.api.host !== 'auto'
			? uiConfig.api.host
			: `${globalThis.location.protocol}//${globalThis.location.hostname}`;

	const locationPortPart = globalThis.location.port ? `:${globalThis.location.port}` : '';
	const portPart = uiConfig.api.port === 'auto' ? locationPortPart : `:${uiConfig.api.port}`;

	return schemeAndHost + portPart;
}
