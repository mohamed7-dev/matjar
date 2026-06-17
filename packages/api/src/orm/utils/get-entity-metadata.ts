import { DataSource } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { AppEntity } from '../../common/helpers/app-entity';
import { ClassType } from '../../common/types/class-type';
import { TranslationEntity } from '../../common/types/translatable';

export function getEntityMetadata<Entity>(
	dataSource: DataSource,
	entity: ClassType<Entity>,
): {
	columns: ColumnMetadata[];
	alias: string;
	translationColumns: ColumnMetadata[];
} {
	const metadata = dataSource.getMetadata(entity);
	const columns = metadata.columns;

	const alias = metadata.name.toLowerCase();

	const translationColumns: ColumnMetadata[] = [];

	const translationRelation = metadata.relations.find((r) => r.propertyName === 'translations');

	if (translationRelation) {
		const commonFields: Array<keyof (TranslationEntity<Entity> & AppEntity)> = [
			'id',
			'createdAt',
			'updatedAt',
			'languageCode',
		];
		const translationEntityMetadata = dataSource.getMetadata(translationRelation.type);
		for (const translationColumn of translationEntityMetadata.columns) {
			if (
				!translationColumn.relationMetadata &&
				!commonFields.includes(translationColumn.propertyName as any)
			) {
				translationColumns.push(translationColumn);
			}
		}
	}
	return {
		columns,
		alias,
		translationColumns,
	};
}
