import path from 'node:path';
import { LANGUAGE_CODE_QUERY_NAME } from '@matjar/common/lib/shared-constants';
import { Module, OnModuleInit } from '@nestjs/common';
import i18next, { TFunction } from 'i18next';
import BackendFS from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import ICU from 'i18next-icu';
import { I18nService } from './i18n.service';

@Module({
	providers: [
		I18nService,
	],
	exports: [
		I18nService,
	],
})
export class I18nModule implements OnModuleInit {
	async onModuleInit(): Promise<TFunction> {
		return await i18next
			.use(i18nextMiddleware.LanguageDetector)
			.use(BackendFS)
			.use(ICU)
			.init({
				fallbackLng: 'en',
				preload: [
					'en',
					'ar',
				],
				detection: {
					lookupQuerystring: LANGUAGE_CODE_QUERY_NAME,
				},
				backend: {
					loadPath: path.join(__dirname, 'locales/{{lng}}.json'),
					jsonIndent: 2,
				},
				nsSeparator: false,
			});
	}
}
