import { AssetType, FilterGroupOperator } from '@matjar/common/lib/generated-types';
import { describe, expect, it } from 'vitest';
import { FilterParameter } from '../../../common/types/list-query-options';
import { Asset } from '../../../entities/asset/asset.entity';
import { AssetTranslation } from '../../../entities/asset/asset-translation.entity';
import {
	buildConditionsFromFilterParams,
	WhereCondition,
	WhereGroup,
} from './build-conditions-from-filter-params';
import { MockDataSource } from './build-order-from-sort-params.spec';

describe('buildConditionsFromFilterParams()', () => {
	it('works when no filter params get passed', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'previewIdentifier',
			},
		]);

		const result = buildConditionsFromFilterParams(dataSource as any, Asset, {});
		expect(result).toEqual([]);
	});

	it('works with single filter param', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'type',
			},
		]);

		const filterParams: FilterParameter<Asset> = {
			type: {
				equals: AssetType.IMAGE,
			},
		};

		const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);

		expect(isWhereCondition(result[0]) && result[0].clause).toBe('asset.type = :arg1');
		expect(isWhereCondition(result[0]) && result[0].parameters).toEqual({
			arg1: AssetType.IMAGE,
		});
	});

	it('works with multiple filter params', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'type',
			},
			{
				propertyName: 'width',
			},
		]);
		const filterParams: FilterParameter<Asset> = {
			type: {
				equals: AssetType.IMAGE,
			},
			width: {
				greaterThan: 500,
			},
		};

		const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
		const firstWhereCondition = result[0];
		const secondWhereCondition = result[1];
		expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
			'asset.type = :arg1',
		);
		expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
			arg1: AssetType.IMAGE,
		});
		expect(isWhereCondition(secondWhereCondition) && secondWhereCondition.clause).toBe(
			'asset.width > :arg2',
		);
		expect(isWhereCondition(secondWhereCondition) && secondWhereCondition.parameters).toEqual({
			arg2: 500,
		});
	});

	it('works with translated entity fields', () => {
		const dataSource = new MockDataSource();
		dataSource.setColumns(Asset, [
			{
				propertyName: 'id',
			},
			{
				propertyName: 'type',
			},
			{
				propertyName: 'width',
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

		const filterParams: FilterParameter<Asset> = {
			type: {
				equals: AssetType.IMAGE,
			},
			name: {
				equals: 'test-file-name',
			},
		};
		const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
		const firstWhereCondition = result[0];
		const secondWhereCondition = result[1];
		expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
			'asset.type = :arg1',
		);
		expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
			arg1: AssetType.IMAGE,
		});
		expect(isWhereCondition(secondWhereCondition) && secondWhereCondition.clause).toBe(
			'asset__translations.name = :arg2',
		);
		expect(isWhereCondition(secondWhereCondition) && secondWhereCondition.parameters).toEqual({
			arg2: 'test-file-name',
		});
	});

	describe('text filter input operators', () => {
		it('equals', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'type',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				type: {
					equals: AssetType.IMAGE,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.type = :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: AssetType.IMAGE,
			});
		});
		it('contains', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'mimetype',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				mimetype: {
					contains: 'image',
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.mimetype LIKE :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: '%image%',
			});
		});
	});

	describe('numeric filter input operators', () => {
		it('equals', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					equals: 500,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width = :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: 500,
			});
		});
		it('greaterThan', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					greaterThan: 500,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width > :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: 500,
			});
		});
		it('greaterThanOrEqual', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					greaterThanOrEqual: 500,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width >= :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: 500,
			});
		});
		it('lessThan', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					lessThan: 500,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width < :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: 500,
			});
		});
		it('lessThanOrEqual', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					lessThanOrEqual: 500,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width <= :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: 500,
			});
		});
		it('withinRange', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'width',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				width: {
					withinRange: {
						min: 0,
						max: 500,
					},
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.width BETWEEN :arg1_a AND :arg1_b',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1_a: 0,
				arg1_b: 500,
			});
		});
	});

	describe('datetime filter input operators', () => {
		it('equals', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'createdAt',
					type: 'datetime',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				createdAt: {
					equals: new Date('2018-01-01T10:00:00.000Z'),
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.createdAt = :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: '2018-01-01 10:00:00.000',
			});
		});
		it('before', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'createdAt',
					type: 'datetime',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				createdAt: {
					before: new Date('2018-01-01T10:00:00.000Z'),
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.createdAt < :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: '2018-01-01 10:00:00.000',
			});
		});
		it('after', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'createdAt',
					type: 'datetime',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				createdAt: {
					after: new Date('2018-01-01T10:00:00.000Z'),
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.createdAt > :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: '2018-01-01 10:00:00.000',
			});
		});
		it('withinRange', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'createdAt',
					type: 'datetime',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				createdAt: {
					withinRange: {
						from: new Date('2018-01-01T10:00:00.000Z'),
						to: new Date('2018-02-01T10:00:00.000Z'),
					},
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.createdAt BETWEEN :arg1_a AND :arg1_b',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1_a: '2018-01-01 10:00:00.000',
				arg1_b: '2018-02-01 10:00:00.000',
			});
		});
	});

	describe('boolean filter input operators', () => {
		it('equals', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'id',
				},
				{
					propertyName: 'isFeatured',
					type: 'boolean',
				},
			]);
			const filterParams: FilterParameter<
				Asset & {
					isFeatured: boolean;
				}
			> = {
				isFeatured: {
					equals: true,
				},
			};

			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereCondition = result[0];
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.clause).toBe(
				'asset.isFeatured = :arg1',
			);
			expect(isWhereCondition(firstWhereCondition) && firstWhereCondition.parameters).toEqual({
				arg1: true,
			});
		});
	});

	describe('filter group operator', () => {
		it('supports and semantic', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'width',
				},
				{
					propertyName: 'type',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				_and: [
					{
						type: {
							equals: AssetType.IMAGE,
						},
					},
					{
						width: {
							greaterThan: 500,
						},
					},
				],
			};
			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereGroup = result[0];
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.operator).toBe(FilterGroupOperator.AND);
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.conditions).toEqual([
				{
					clause: 'asset.type = :arg1',
					parameters: {
						arg1: AssetType.IMAGE,
					},
				},
				{
					clause: 'asset.width > :arg2',
					parameters: {
						arg2: 500,
					},
				},
			]);
		});
		it('supports or semantic', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'width',
				},
				{
					propertyName: 'type',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				_or: [
					{
						type: {
							equals: AssetType.IMAGE,
						},
					},
					{
						width: {
							greaterThan: 500,
						},
					},
				],
			};
			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereGroup = result[0];
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.operator).toBe(FilterGroupOperator.OR);
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.conditions).toEqual([
				{
					clause: 'asset.type = :arg1',
					parameters: {
						arg1: AssetType.IMAGE,
					},
				},
				{
					clause: 'asset.width > :arg2',
					parameters: {
						arg2: 500,
					},
				},
			]);
		});
		it('supports nesting and, or semantics', () => {
			const dataSource = new MockDataSource();
			dataSource.setColumns(Asset, [
				{
					propertyName: 'width',
				},
				{
					propertyName: 'type',
				},
			]);
			const filterParams: FilterParameter<Asset> = {
				_and: [
					{
						width: {
							greaterThan: 500,
						},
					},
					{
						_or: [
							{
								type: {
									equals: AssetType.IMAGE,
								},
							},
							{
								type: {
									equals: AssetType.VIDEO,
								},
							},
						],
					},
				],
			};
			const result = buildConditionsFromFilterParams(dataSource as any, Asset, filterParams);
			const firstWhereGroup = result[0];
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.operator).toBe(FilterGroupOperator.AND);
			expect(isWhereGroup(firstWhereGroup) && firstWhereGroup.conditions).toEqual([
				{
					clause: 'asset.width > :arg1',
					parameters: {
						arg1: 500,
					},
				},
				{
					operator: FilterGroupOperator.OR,
					conditions: [
						{
							clause: 'asset.type = :arg2',
							parameters: {
								arg2: AssetType.IMAGE,
							},
						},
						{
							clause: 'asset.type = :arg3',
							parameters: {
								arg3: AssetType.VIDEO,
							},
						},
					],
				},
			]);
		});
	});
});

function isWhereCondition(item: WhereCondition | WhereGroup): item is WhereCondition {
	return 'clause' in item;
}

function isWhereGroup(item: WhereCondition | WhereGroup): item is WhereGroup {
	return 'conditions' in item;
}
