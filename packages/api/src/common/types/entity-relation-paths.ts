import { AppEntity } from '../helpers/app-entity';
import { TranslationEntity } from './translatable';

export type EntityRelationKeys<Entity extends AppEntity> = {
	[K in Extract<keyof Entity, string>]: Required<Entity>[K] extends
		| AppEntity
		| TranslationEntity<AppEntity>
		| null
		? K
		: Required<Entity>[K] extends AppEntity[] | Array<TranslationEntity<AppEntity>>
			? K
			: never;
}[Extract<keyof Entity, string>];

export type EntityRelations<T extends AppEntity> = {
	[K in EntityRelationKeys<T>]: T[K];
};

export type TripleDotPath = `${string}.${string}.${string}`;

// one level of relation keys e.g. product.variants
export type PathsToStringProps1<Entity extends AppEntity> = Entity extends string
	? []
	: {
			[K in EntityRelationKeys<Entity>]: K;
		}[Extract<EntityRelationKeys<Entity>, string>];

// two levels of relation keys e.g. product.variants.productOptions
export type PathsToStringProps2<Entity extends AppEntity> = Entity extends string
	? never
	: {
			[K in EntityRelationKeys<Entity>]: Entity[K] extends AppEntity[]
				? [
						K,
						PathsToStringProps1<Entity[K][number]>,
					]
				: Entity[K] extends AppEntity | undefined
					? [
							K,
							PathsToStringProps1<NonNullable<Entity[K]>>,
						]
					: never;
		}[Extract<EntityRelationKeys<Entity>, string>];

export type EntityRelationPaths<Entity extends AppEntity> =
	| PathsToStringProps1<Entity>
	| Join<PathsToStringProps2<Entity>, '.'>
	| TripleDotPath;

// Based on https://stackoverflow.com/a/47058976/772859
export type Join<T extends Array<string | any>, D extends string> = T extends []
	? never
	: T extends [
				infer F,
			]
		? F
		: T extends [
					infer F,
					...infer R,
				]
			? F extends string
				? `${F}${D}${Join<Extract<R, string[]>, D>}`
				: never
			: string;
