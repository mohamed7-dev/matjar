import { DataSource, OrderByCondition } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { UserInputError } from '../../../common/errors/errors';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import { NullOptionals, SortParameter } from '../../../common/types/list-query-options';
import { filterUnique } from '../../../common/utils/filter-unique';
import { getEntityMetadata } from '../../../orm/utils/get-entity-metadata';

export function buildOrderFromSortParams<Entity extends AppEntity>(
	dataSource: DataSource,
	entityType: ClassType<Entity>,
	sortParams?: NullOptionals<SortParameter<Entity>> | null,
	customPropsMap?: Record<string, string>,
	entityAlias?: string,
): OrderByCondition {
	if (!sortParams) return {};

	const { columns, alias: defaultAlias, translationColumns } = getEntityMetadata(dataSource, entityType);
	const alias = entityAlias ?? defaultAlias;

	// TODO: get calculated columns and handle them as well
	const output: OrderByCondition = {};

	for (const [sortProp, direction] of Object.entries(sortParams)) {
		const columnMatch = columns.find((col) => col.propertyName === sortProp);
		const translationColumnMatch = translationColumns.find((col) => col.propertyName === sortProp);
		if (columnMatch) {
			output[`${alias}.${columnMatch.propertyPath}`] = direction as any;
		} else if (translationColumnMatch) {
			const translationsAlias = dataSource.namingStrategy.joinTableName(alias, 'translations', '', '');

			output[`${translationsAlias}.${translationColumnMatch.propertyPath}`] = direction as any;
		} else if (customPropsMap?.[sortProp]) {
			output[customPropsMap[sortProp]] = direction as any;
		} else {
			throw new UserInputError('errors.invalid_sort_field', {
				fieldName: sortProp,
				validFields: [
					...getValidSortFields([
						...columns,
						...translationColumns,
					]),
					// TODO: list all calculated fields here
				].join(','),
			});
		}
	}

	return output;
}

function getValidSortFields(columns: ColumnMetadata[]): string[] {
	return filterUnique(columns.map((c) => c.propertyName));
}
