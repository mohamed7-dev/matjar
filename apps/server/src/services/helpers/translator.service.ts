import { LanguageCode } from '@matjar/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { DEFAULT_ENTITY_TRANSLATION_LANGUAGE_CODE } from '../../common/constants/defaults';
import { InternalServerError } from '../../common/errors/errors';
import { AppEntity } from '../../common/helpers/app-entity';
import { Translatable, Translated, TranslationEntity } from '../../common/types/translatable';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TranslatorService {
	constructor(private readonly configService: ConfigService) {}
	public translate<TranslatableEntity extends AppEntity & Translatable>(
		ctx: RequestContext,
		translatableEntity: TranslatableEntity,
	): Translated<TranslatableEntity> {
		return this.translateRecursively(translatableEntity, [
			ctx.languageCode,
			ctx.marketplaceRegion.primaryLanguageCode,
			this.configService.defaultLanguageCode,
		]);
	}

	private translateRecursively<TranslatableEntity extends AppEntity & Translatable>(
		translatableEntity: TranslatableEntity,
		languageCode:
			| LanguageCode
			| [
					LanguageCode,
					...LanguageCode[],
			  ],
	): Translated<TranslatableEntity> {
		let translatedEntity: Translated<TranslatableEntity>;

		try {
			translatedEntity = this.translateEntity(translatableEntity, languageCode);
		} catch {
			translatedEntity = translatableEntity as any;
		}

		return translatedEntity;
	}

	private translateEntity<TranslatableEntity extends AppEntity & Translatable>(
		translatableEntity: TranslatableEntity,
		languageCode:
			| LanguageCode
			| [
					LanguageCode,
					...LanguageCode[],
			  ],
	): Translated<TranslatableEntity> {
		let translation: TranslationEntity<AppEntity> | undefined;
		let defaultTranslation: TranslationEntity<AppEntity> | undefined;

		if (translatableEntity.translations) {
			if (Array.isArray(languageCode)) {
				for (const lc of languageCode) {
					translation = translatableEntity.translations.find((tr) => tr.languageCode === lc);
					if (translation) break;
				}
			} else {
				translation = translatableEntity.translations.find((tr) => tr.languageCode === languageCode);
			}

			if (!translation && languageCode !== DEFAULT_ENTITY_TRANSLATION_LANGUAGE_CODE) {
				// if no translation found up to this point, we fallback to resolving the translation of the default languageCode
				defaultTranslation = translatableEntity.translations.find(
					(t) => t.languageCode === DEFAULT_ENTITY_TRANSLATION_LANGUAGE_CODE,
				);
				translation = defaultTranslation;
			}

			if (!translation) {
				// Last resort: if no translation found, we fallback to returning the first translation to suppress the graphql error
				translation = translatableEntity.translations[0];
			}
		}

		if (!translation) {
			throw new InternalServerError('error.entity_has_no_translation_in_language', {
				entityName: translatableEntity.constructor.name,
				languageCode: Array.isArray(languageCode) ? languageCode.join() : languageCode,
			});
		}

		const translatedEntity = Object.create(
			Object.getPrototypeOf(translatableEntity),
			Object.getOwnPropertyDescriptors(translatableEntity),
		);

		for (const [key, value] of Object.entries(translation)) {
			if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'base') {
				if (key !== 'languageCode' && (value == null || value === '')) {
					translatedEntity[key] = '';
				} else {
					translatedEntity[key] = value ?? '';
				}
			}
		}
		return translatedEntity;
	}
}
