import { RequestContext } from '../../../api/request-context/request-context';
import { InternalServerError } from '../../../common/errors/errors';
import { DeepPartial } from '../../../common/types/deep-partial';
import { Translatable, TranslationEntity, TranslationInput } from '../../../common/types/translatable';
import { foundIn } from '../../../common/utils/found-in';
import { not } from '../../../common/utils/not';
import { OrmService } from '../../../orm/orm.service';

type TranslationEntityType<Entity> = new (
	input?: DeepPartial<TranslationInput<Entity>> | DeepPartial<TranslationEntity<Entity>>,
) => TranslationEntity<Entity>;

export interface TranslationDiff<Entity> {
	toUpdate: Array<TranslationEntity<Entity>>;
	toAdd: Array<TranslationEntity<Entity>>;
}

/**
 * @description
 * This class is responsible for answering the question what has changed between existing translations
 * and the `input.translations`
 */
export class TranslationDiffer<
	Entity extends Translatable & {
		id: string;
	},
> {
	constructor(
		private readonly translationEntityType: TranslationEntityType<Entity>,
		private readonly ormService: OrmService,
	) {}

	public diff(
		existing: Array<TranslationEntity<Entity>>,
		inputs?: Array<TranslationInput<Entity>> | null,
	): TranslationDiff<Entity> {
		if (inputs) {
			const translationEntities = this.translationInputsToEntities(existing, inputs);
			// to add means that it wasn't found in the db, and we are willing to insert it
			const toAdd = translationEntities.filter(not(foundIn(existing, 'languageCode')));
			// to update means that it was found in the db, and we are willing to update it
			const toUpdate = translationEntities.filter(foundIn(existing, 'languageCode'));
			return {
				toUpdate,
				toAdd,
			};
		} else {
			return {
				toAdd: [],
				toUpdate: [],
			};
		}
	}

	public async applyDiff(
		ctx: RequestContext,
		entity: Entity,
		diff: TranslationDiff<Entity>,
	): Promise<Entity> {
		const { toAdd, toUpdate } = diff;

		if (toAdd.length) {
			for (const translation of toAdd) {
				translation.base = entity;
				(translation as any).baseId = entity.id;
				let newTranslation: any;

				try {
					newTranslation = await this.ormService
						.getRepository(ctx, this.translationEntityType)
						.save(translation as any);
				} catch (err: any) {
					throw new InternalServerError(err.message);
				}
				entity.translations.push(newTranslation);
			}
		}

		if (toUpdate.length) {
			for (const translation of toUpdate) {
				const updated = await this.ormService
					.getRepository(ctx, this.translationEntityType)
					.save(translation as any);

				const index = entity.translations.findIndex((t) => t.languageCode === updated.languageCode);
				entity.translations.splice(index, 1, updated);
			}
		}

		return entity;
	}

	private translationInputsToEntities(
		existing: Array<TranslationEntity<Entity>>,
		inputs: Array<TranslationInput<Entity>>,
	): Array<TranslationEntity<Entity>> {
		return inputs.map((input) => {
			// find the counterpart in the existing translations by language code
			const counterpart = existing.find((e) => e.languageCode === input.languageCode);
			// create new entity with input provided
			// and the copy the id, and the base from the existing translation if counterpart is found
			const entity = new this.translationEntityType(input as any);
			if (counterpart) {
				entity.id = counterpart.id;
				entity.base = counterpart.base;
			}
			return entity;
		});
	}
}
