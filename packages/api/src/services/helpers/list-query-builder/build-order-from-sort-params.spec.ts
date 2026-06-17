import { DefaultNamingStrategy } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';
import { describe, expect, it } from 'vitest';
import { ClassType } from '../../../common/types/class-type';
import { SortParameter } from '../../../common/types/list-query-options';
import { Asset } from '../../../entities/asset/asset.entity';
import { AssetTranslation } from '../../../entities/asset/asset-translation.entity';
import { buildOrderFromSortParams } from './build-order-from-sort-params';

describe('buildOrderFromSortParams()', () => {
	it('works with no sort params', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'previewIdentifier',
			},
		]);

		const result = buildOrderFromSortParams(dataSource as any, Asset, {});

		expect(result).toEqual({});
	});

	it('works with a single sort param', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
		]);

		const sortParams: SortParameter<Asset> = {
			id: 'ASC',
		};

		const result = buildOrderFromSortParams(dataSource as any, Asset, sortParams);

		expect(result).toEqual({
			'asset.id': 'ASC',
		});
	});

	it('works with multiple sort params', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'fileSize',
			},
			{
				propertyName: 'createdId',
			},
		]);

		const sortParams: SortParameter<Asset> = {
			id: 'ASC',
			fileSize: 'DESC',
		};

		const result = buildOrderFromSortParams(dataSource as any, Asset, sortParams);

		expect(result).toEqual({
			'asset.id': 'ASC',
			'asset.fileSize': 'DESC',
		});
	});

	it('works with localized fields', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
		]);
		dataSource.setRelations(Asset, [
			{
				propertyName: 'translations',
				type: AssetTranslation,
			},
		]);
		dataSource.setColumns(AssetTranslation, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'name',
			},
			{
				propertyName: 'base',
				relationMetadata: {} as any,
			},
		]);

		const sortParams: SortParameter<Asset> = {
			id: 'ASC',
			name: 'DESC',
		};

		const result = buildOrderFromSortParams(dataSource as any, Asset, sortParams);

		expect(result).toEqual({
			'asset.id': 'ASC',
			'asset__translations.name': 'DESC',
		});
	});

	it('throws when an invalid field is passed', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
		]);
		dataSource.setRelations(Asset, [
			{
				propertyName: 'translations',
				type: AssetTranslation,
			},
		]);
		dataSource.setColumns(AssetTranslation, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'name',
			},
			{
				propertyName: 'base',
				relationMetadata: {} as any,
			},
		]);

		const sortParams: SortParameter<Asset> & {
			invalid: any;
		} = {
			invalid: 'DESC',
		};

		try {
			buildOrderFromSortParams(dataSource as any, Asset, sortParams);
		} catch (error: any) {
			expect(error.message).toBe('errors.invalid_sort_field');
			expect(error.variables.fieldName).toBe('invalid');
			expect(error.variables.validFields).toEqual('id,name');
		}
	});
});

export class MockDataSource {
	private columnsMap = new Map<ClassType<any>, Array<Partial<ColumnMetadata>>>();
	private relationsMap = new Map<ClassType<any>, Array<Partial<RelationMetadata>>>();

	setColumns(entity: ClassType<any>, value: Array<Partial<ColumnMetadata>>): void {
		value.forEach((v) => {
			v.propertyPath = v.propertyName;
		});
		this.columnsMap.set(entity, value);
	}

	setRelations(entity: ClassType<any>, value: Array<Partial<RelationMetadata>>): void {
		this.relationsMap.set(entity, value);
	}

	getMetadata = (
		entity: ClassType<any>,
	): {
		name: string;
		columns: Partial<ColumnMetadata>[];
		relations: Partial<RelationMetadata>[];
	} => {
		return {
			name: entity.name,
			columns: this.columnsMap.get(entity) || [],
			relations: this.relationsMap.get(entity) || [],
		};
	};

	namingStrategy = new DefaultNamingStrategy();
	readonly options = {
		type: 'sqljs',
	};
}
