import { LanguageCode } from '@matjar/common/lib/generated-types';
import { AppEntity } from '../helpers/app-entity';

export type LocaleString = string & {
	_opaqueType: 'LocaleString';
};

export type TranslatableKeys<Entity, EntityWithNoTrans = Omit<Entity, 'translations'>> = {
	[Key in keyof EntityWithNoTrans]: EntityWithNoTrans[Key] extends LocaleString ? Key : never;
}[keyof EntityWithNoTrans];

export type TranslationEntity<Entity> = {
	base: Entity;
	languageCode: LanguageCode;
	id: string;
	createdAt: Date;
	updatedAt: Date;
} & { [Key in TranslatableKeys<Entity>]: string };

export interface Translatable {
	translations: Array<TranslationEntity<AppEntity>>;
}

/**
 * @description
 * This type represents an entity after being translated
 */
export type Translated<Entity> = Entity & {
	languageCode: LanguageCode;
};
