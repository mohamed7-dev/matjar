import { i18n, type Messages } from '@lingui/core';

export async function loadI18nMessages(locale: string): Promise<Messages> {
	// TODO: customize this behavior for production build to prevent bundling of po files
	const { messages } = await import(`../i18n/dictionaries/${locale}.po`);
	return {
		...messages,
	};
}

export const defaultLocale = 'en';

export async function dynamicActivate(locale: string, onActivate?: () => void) {
	const messages = await loadI18nMessages(locale);
	i18n.load(locale, messages);
	i18n.activate(locale);
	onActivate?.();
}
