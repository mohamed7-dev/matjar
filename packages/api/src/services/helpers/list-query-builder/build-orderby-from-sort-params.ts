import { DataSource, OrderByCondition } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { UserInputError } from '../../../common/errors/errors';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import { NullOptionals, SortParameter } from '../../../common/types/list-query-options';
import { filterUnique } from '../../../common/utils/filter-unique';
import { getEntityMetadata } from '../../../orm/utils/get-entity-metadata';

export function buildOrderByFromSortParams<Entity extends AppEntity>(
	entity: ClassType<Entity>,
	dataSource: DataSource,
	sortParams?: NullOptionals<SortParameter<Entity>> | null,
	entityAlias?: string,
): OrderByCondition {
	if (!sortParams || Object.keys(sortParams).length === 0) return {};
	const { columns, alias: defaultAlias } = getEntityMetadata(dataSource, entity);
	const alias = entityAlias ?? defaultAlias;

	const output: OrderByCondition = {};

	for (const [key, orderDirection] of Object.entries(sortParams)) {
		const matchingColumn = columns.find((c) => c.propertyName === key);
		if (matchingColumn) {
			output[`${alias}.${matchingColumn.propertyPath}`] = orderDirection as any;
		} else {
			throw new UserInputError('errors.invalid_sort_field', {
				fieldName: key,
				validFields: [
					...getValidSortFields([
						...columns,
					]),
				].join(', '),
			});
		}
	}

	return output;
}

function getValidSortFields(columns: ColumnMetadata[]): string[] {
	return filterUnique(columns.map((c) => c.propertyName));
}
