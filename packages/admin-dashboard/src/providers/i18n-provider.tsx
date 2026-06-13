import { i18n } from '@lingui/core';
import { I18nProvider as BaseI18nProvider } from '@lingui/react';
import type React from 'react';

export function I18nProvider({ children }: { children: React.ReactNode }) {
	return <BaseI18nProvider i18n={i18n}>{children}</BaseI18nProvider>;
}
