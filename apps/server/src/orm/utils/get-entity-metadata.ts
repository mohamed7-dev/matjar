import { DataSource } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { ClassType } from '../../common/types/class-type';

export function getEntityMetadata<Entity>(
	dataSource: DataSource,
	entity: ClassType<Entity>,
): {
	columns: ColumnMetadata[];
	alias: string;
} {
	const metadata = dataSource.getMetadata(entity);
	const columns = metadata.columns;

	const alias = metadata.name.toLowerCase();
	return {
		columns,
		alias,
	};
}
