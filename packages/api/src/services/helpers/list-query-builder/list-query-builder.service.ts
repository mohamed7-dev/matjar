import { FilterGroupOperator } from '@matjar/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import {
	Brackets,
	FindOneOptions,
	FindOptionsWhere,
	Repository,
	SelectQueryBuilder,
	WhereExpressionBuilder,
} from 'typeorm';
import { RequestContext } from '../../../api/request-context/request-context';
import { ApiType } from '../../../api/utils/get-api-type';
import { UserInputError } from '../../../common/errors/errors';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import {
	FilterParameter,
	ListQueryOptions,
	NullOptionals,
	SortParameter,
} from '../../../common/types/list-query-options';
import { isObject } from '../../../common/utils/data-type-checkers';
import { filterUnique } from '../../../common/utils/filter-unique';
import { ConfigService } from '../../../config/config.service';
import { OrmService } from '../../../orm/orm.service';
import { getEntityMetadata } from '../../../orm/utils/get-entity-metadata';
import {
	buildConditionsFromFilterParams,
	WhereCondition,
	WhereGroup,
} from './build-conditions-from-filter-params';
import { buildOrderFromSortParams } from './build-order-from-sort-params';

interface ExtraOptions<Entity extends AppEntity> {
	ignoreQueryLimits?: boolean;
	ctx?: RequestContext;
	alias?: string;
	orderBy?: FindOneOptions<Entity>['order'];
	marketplaceRegionId?: string;
	customPropsMap?: Record<string, string>;
	relations?: string[];
	where?: FindOptionsWhere<Entity>;
}

@Injectable()
export class ListQueryBuilder {
	constructor(
		private readonly ormService: OrmService,
		private readonly configService: ConfigService,
	) {}

	build<Entity extends AppEntity>(
		entityType: ClassType<Entity>,
		options: ListQueryOptions<Entity> = {},
		extraOptions: ExtraOptions<Entity> = {},
	): SelectQueryBuilder<Entity> {
		// options.take, and options.skip must be validated before passing them to the qb
		// validation includes:
		// --- take mustn't be > config.actor.listQueryLimit
		// --- take can't be 0
		// --- skip mustn't be -ve value

		const apiType = extraOptions?.ctx ? extraOptions.ctx.apiType : 'store';

		const { take, skip } = this.parsePaginationParams(
			options,
			apiType,
			extraOptions.ignoreQueryLimits ?? false,
		);

		const ctx = extraOptions?.ctx ? extraOptions.ctx : undefined;
		const repo = ctx
			? this.ormService.getRepository(ctx, entityType)
			: this.ormService.dataSource.getRepository(entityType);

		const alias = extraOptions?.alias ? extraOptions.alias : entityType.name.toLowerCase();

		// get minimum relations required by the custom props map and the marketplace if specified
		const minimumRequiredRelations = this.getMinimumRequiredRelations(extraOptions, options, repo);
		const relations = filterUnique([
			...minimumRequiredRelations,
			...(extraOptions?.relations ?? []),
		]);

		const qb = repo.createQueryBuilder(alias);

		qb.setFindOptions({
			relations,
			take,
			skip,
			relationLoadStrategy: 'query',
			where: extraOptions?.where ?? {},
		});

		// TODO: don't forget to join relations needed by calculated columns

		const { customPropsMap } = extraOptions;

		if (customPropsMap) {
			// TODO: normalize custom property map and mutate it in the memory
			// this.normalizeCustomPropertyMap(customPropsMap, options, qb);
		}

		const sortParams = Object.assign({}, options.sort, extraOptions.orderBy);

		// join the translations entity if needed
		this.applyTranslationConditions(entityType, qb, sortParams, extraOptions.ctx);

		// maps gql input fields to typeorm OrderByCondition
		const order = buildOrderFromSortParams(
			this.ormService.dataSource,
			entityType,
			sortParams,
			customPropsMap,
			alias,
		);

		// maps gql input fields to where clause and params
		const filter = buildConditionsFromFilterParams(
			this.ormService.dataSource,
			entityType,
			options.filter,
			customPropsMap,
			qb.alias,
		);

		if (filter.length) {
			qb.andWhere(
				new Brackets((qb1) => {
					for (const condition of filter) {
						if ('conditions' in condition) {
							this.addNestedWhereClause(qb1, condition, FilterGroupOperator.AND);
						} else {
							this.applyWhereCondition(qb1, condition, FilterGroupOperator.AND);
						}
					}
				}),
			);
		}

		if (extraOptions.marketplaceRegionId) {
			qb.innerJoin(`${alias}.marketplaceRegions`, 'mpr', 'mpr.id = :marketplaceId', {
				marketplaceId: extraOptions.marketplaceRegionId,
			});
		}

		qb.orderBy(order);

		return qb;
	}

	private getMinimumRequiredRelations<Entity extends AppEntity>(
		extraOptions: ExtraOptions<Entity>,
		options: ListQueryOptions<Entity>,
		repo: Repository<Entity>,
	): string[] {
		const requiredRelations: string[] = [];

		if (extraOptions.marketplaceRegionId) {
			requiredRelations.push('marketplaceRegions');
		}

		if (extraOptions.customPropsMap) {
			// {city: customer.addresses.city}
			for (const [prop, path] of Object.entries(extraOptions.customPropsMap)) {
				if (!this.isCustomPropUsed(prop, options)) {
					continue;
				}
				// customer.addresses.city -> ["customer","addresses"]
				const relationPath = path.split('.').slice(0, -1);

				let targetMetadata = repo.metadata;
				const reconstructedPath = [];

				for (const pathPart of relationPath) {
					// 1st iteration -> reconstructedPath = ["customer"]
					//               -> requiredRelations  = ["customer"]
					// 2nd iteration -> reconstructedPath = ["customer","addresses"]
					//               -> requiredRelations  = ["customer","customer.addresses"]
					const relationMetadata = targetMetadata.findRelationWithPropertyPath(pathPart);
					if (relationMetadata) {
						reconstructedPath.push(relationMetadata.propertyName);
						requiredRelations.push(reconstructedPath.join('.'));
						targetMetadata = relationMetadata.inverseEntityMetadata;
					}
				}
			}
		}
		return filterUnique(requiredRelations);
	}

	private isCustomPropUsed(prop: string, options: ListQueryOptions<any>): boolean {
		return !!options.sort?.[prop] || this.isCustomPropUsedInFilter(prop, options.filter);
	}

	private isCustomPropUsedInFilter(
		prop: string,
		filterParams?: NullOptionals<FilterParameter<any>> | null,
	): boolean {
		return !!(
			filterParams &&
			(filterParams[prop] ||
				filterParams._and?.some((f) => this.isCustomPropUsedInFilter(prop, f)) ||
				filterParams._or?.some((f) => this.isCustomPropUsedInFilter(prop, f)))
		);
	}

	private isRelationAlreadyJoined<Entity extends AppEntity>(
		qb: SelectQueryBuilder<Entity>,
		alias: string,
	): boolean {
		return qb.expressionMap.joinAttributes.some((ja) => ja.alias.name === alias);
	}

	private applyTranslationConditions<Entity extends AppEntity>(
		entityType: ClassType<Entity>,
		qb: SelectQueryBuilder<Entity>,
		sortParams: NullOptionals<SortParameter<Entity>> & FindOneOptions<Entity>['order'],
		ctx?: RequestContext,
	): void {
		const languageCode = ctx?.languageCode || this.configService.defaultLanguageCode;

		const { translationColumns } = getEntityMetadata(this.ormService.dataSource, entityType);
		const alias = qb.alias;

		let sortingOnTranslatableKey = false;
		const sortKeys = Object.keys(sortParams);

		for (const translationColumn of translationColumns) {
			if (sortKeys.includes(translationColumn.propertyName)) {
				sortingOnTranslatableKey = true;
			}
		}

		if (sortingOnTranslatableKey) {
			const translationsAlias = qb.connection.namingStrategy.joinTableName(
				alias,
				'translations',
				'',
				'',
			);
			if (!this.isRelationAlreadyJoined(qb, translationsAlias)) {
				qb.leftJoinAndSelect(`${alias}.translations`, translationsAlias);
			}
			qb.andWhere(
				new Brackets((qb1) => {
					qb1.where(`${translationsAlias}.languageCode = :languageCode`, {
						languageCode,
					});
					const defaultLanguageCode =
						ctx?.marketplaceRegion.primaryLanguageCode ?? this.configService.defaultLanguageCode;
					const translationEntity = translationColumns[0].entityMetadata.target;

					if (languageCode !== defaultLanguageCode) {
						qb1.orWhere(
							new Brackets((qb2) => {
								const subQb1 = this.ormService.dataSource
									.createQueryBuilder(translationEntity, 'translation')
									.where(`translation.base = ${alias}.id`)
									.andWhere('translation.languageCode = :defaultLanguageCode');
								const subQb2 = this.ormService.dataSource
									.createQueryBuilder(translationEntity, 'translation')
									.where(`translation.base = ${alias}.id`)
									.andWhere('translation.languageCode = :nonDefaultLanguageCode');

								qb2.where(`EXISTS (${subQb1.getQuery()})`).andWhere(
									`NOT EXISTS (${subQb2.getQuery()})`,
								);
							}),
						);
					} else {
						qb1.orWhere(
							new Brackets((qb2) => {
								const subQb1 = this.ormService.dataSource
									.createQueryBuilder(translationEntity, 'translation')
									.where(`translation.base = ${alias}.id`)
									.andWhere('translation.languageCode = :defaultLanguageCode');
								const subQb2 = this.ormService.dataSource
									.createQueryBuilder(translationEntity, 'translation')
									.where(`translation.base = ${alias}.id`)
									.andWhere('translation.languageCode != :defaultLanguageCode');

								qb2.where(`NOT EXISTS (${subQb1.getQuery()})`).andWhere(
									`EXISTS (${subQb2.getQuery()})`,
								);
							}),
						);
					}
					qb.setParameters({
						nonDefaultLanguageCode: languageCode,
						defaultLanguageCode,
					});
				}),
			);
		}
	}

	private addNestedWhereClause(
		qb: WhereExpressionBuilder,
		group: WhereGroup,
		parentOperator: FilterGroupOperator,
	): void {
		if (group.conditions.length) {
			const subQueryBuilder = new Brackets((qb1) => {
				group.conditions.forEach((condition) => {
					if ('conditions' in condition) {
						this.addNestedWhereClause(qb1, condition, group.operator);
					} else {
						this.applyWhereCondition(qb1, condition, group.operator);
					}
				});
			});

			if (parentOperator === FilterGroupOperator.AND) {
				qb.andWhere(subQueryBuilder);
			} else {
				qb.orWhere(subQueryBuilder);
			}
		}
	}

	private applyWhereCondition(
		qb: WhereExpressionBuilder,
		condition: WhereCondition,
		operator: FilterGroupOperator,
	): void {
		if (operator === FilterGroupOperator.AND) {
			qb.andWhere(condition.clause, condition.parameters);
		} else {
			qb.orWhere(condition.clause, condition.parameters);
		}
	}

	private parsePaginationParams(
		options: ListQueryOptions<any>,
		apiType: ApiType,
		ignoreQueryLimits: boolean,
	): {
		take: number;
		skip: number;
	} {
		const { admin, store } = this.configService.api;
		let max = 0;

		if (ignoreQueryLimits) {
			max = Number.MAX_SAFE_INTEGER;
		} else if (apiType === 'admin') {
			max = admin.listQueryLimit;
		} else if (apiType === 'store') {
			max = store.listQueryLimit;
		}

		const takeOptionExists = isObject(options) && 'take' in options;

		if (takeOptionExists && options.take && options.take > max) {
			throw new UserInputError('errors');
		}

		let take = max;

		if (takeOptionExists && options.take == null) {
			take = max;
		} else if (takeOptionExists && options.take) {
			// max -> 1000
			// take -> 10 *

			// max -> 1000 *
			// take -> 0

			// max -> 1000 *
			// take -> -10
			take = Math.min(max, Math.max(options.take, 0));
		}

		const skipOptionsExists = isObject(options) && 'skip' in options;

		const skip = skipOptionsExists ? Math.max(options.skip ?? 0, 0) : 0;

		if (
			skipOptionsExists &&
			options.skip !== undefined &&
			takeOptionExists &&
			options.take === undefined
		) {
			take = max;
		}
		return {
			skip,
			take,
		};
	}
}
