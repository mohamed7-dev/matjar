import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { RequestContext } from '../../../api/request-context/request-context';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import { Translatable, TranslatedInput, TranslationEntity } from '../../../common/types/translatable';
import { omit } from '../../../common/utils/omit';
import { OrmService } from '../../../orm/orm.service';
import { patchEntity } from '../../../orm/utils/patch-entity';
import { TranslationDiffer } from './translation-differ';

export interface CreateTranslatableOptions<Entity extends Translatable> {
	ctx: RequestContext;
	entityType: ClassType<Entity>;
	translationEntityType: ClassType<TranslationEntity<Entity>>;
	input: TranslatedInput<Entity>;
	beforeSave?: (newEntity: Entity) => any | Promise<any>;
	typeOrmSubscriberData?: any;
}

export interface UpdateTranslatableOptions<Entity extends Translatable>
	extends CreateTranslatableOptions<Entity> {
	input: TranslatedInput<Entity> & {
		id: string;
	};
}

@Injectable()
export class TranslatableSaver {
	constructor(private readonly ormService: OrmService) {}

	public async update<Entity extends AppEntity & Translatable>(
		options: UpdateTranslatableOptions<Entity>,
	): Promise<Entity> {
		const { ctx, entityType, translationEntityType, input, beforeSave, typeOrmSubscriberData } = options;
		const foundTranslations = await this.ormService.getRepository(ctx, translationEntityType).find({
			relationLoadStrategy: 'query',
			loadEagerRelations: false,
			where: {
				base: {
					id: input.id,
				},
			},
			relations: {
				base: true,
			},
		} as FindManyOptions<TranslationEntity<Entity>>);

		const differ = new TranslationDiffer(translationEntityType, this.ormService);
		const diff = differ.diff(foundTranslations, input.translations);
		const entity = await differ.applyDiff(
			ctx,
			new entityType({
				...input,
				translations: foundTranslations,
			}),
			diff,
		);
		entity.updatedAt = new Date();
		const updatedEntity = patchEntity(
			entity as any,
			omit(input, [
				'translations',
			]),
		);
		if (typeof beforeSave === 'function') {
			await beforeSave(entity);
		}
		return this.ormService.getRepository(ctx, entityType).save(updatedEntity, {
			data: typeOrmSubscriberData,
		});
	}
}
