import { Injectable } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { RequestContext } from '../../../api/request-context/request-context';
import { ApiType } from '../../../api/utils/get-api-type';
import { UserInputError } from '../../../common/errors/errors';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import { ListQueryOptions } from '../../../common/types/list-query-options';
import { isObject } from '../../../common/utils/data-type-checkers';
import { ConfigService } from '../../../config/config.service';
import { OrmService } from '../../../orm/orm.service';
import { buildOrderByFromSortParams } from './build-orderby-from-sort-params';

interface ExtraQueryOptions<Entity extends AppEntity> {
	ctx?: RequestContext;
	entityAlias?: string;
	ignoreQueryLimits?: boolean;
	marketplaceRegionId?: string;
	where?: FindOptionsWhere<Entity>;
	orderBy?: FindOneOptions<Entity>['order'];
	relations?: any; // TODO:change to a more appropriate type
}

@Injectable()
export class ListQueryBuilder {
	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
	) {}
	public build<Entity extends AppEntity>(
		entity: ClassType<Entity>,
		listQueryOptions: ListQueryOptions<Entity> = {},
		extraOptions: ExtraQueryOptions<Entity> = {},
	): SelectQueryBuilder<Entity> {
		listQueryOptions = listQueryOptions || {};
		const apiType = extraOptions.ctx?.apiType ?? 'store';
		const { skip, take } = this.parsePaginationParams(
			apiType,
			listQueryOptions,
			extraOptions.ignoreQueryLimits,
		);

		const repository = extraOptions.ctx
			? this.ormService.getRepository(extraOptions.ctx, entity)
			: this.ormService.dataSource.getRepository(entity);
		const alias = extraOptions.entityAlias ?? entity.name.toLowerCase();

		const queryBuilder = repository.createQueryBuilder(alias);

		queryBuilder.setFindOptions({
			relationLoadStrategy: 'query',
			take,
			skip,
			where: extraOptions.where ?? {},
		});

		const sortParams = Object.assign({}, listQueryOptions.sort, extraOptions.orderBy);
		const sort = buildOrderByFromSortParams(
			entity,
			this.ormService.dataSource,
			sortParams,
			queryBuilder.alias,
		);

		// TODO: build conditions from filter params

		if (extraOptions.marketplaceRegionId) {
			queryBuilder.innerJoin(
				`${queryBuilder.alias}.marketplaceRegions`,
				'lqb__marketplace',
				'lqb__marketplace.id = :marketplaceId',
				{
					marketplaceId: extraOptions.marketplaceRegionId,
				},
			);
		}
		queryBuilder.orderBy(sort);

		return queryBuilder;
	}

	private parsePaginationParams(
		apiType: ApiType,
		options: ListQueryOptions<any>,
		ignoreQueryLimits: boolean = false,
	): {
		take: number;
		skip: number;
	} {
		const { admin, store } = this.configService.api;
		let max: number = 0;
		if (ignoreQueryLimits) {
			max = Number.MAX_SAFE_INTEGER;
		} else if (apiType === 'admin') {
			max = admin.listQueryLimit;
		} else {
			max = store.listQueryLimit;
		}
		const takeOptionsExists = isObject(options) && 'take' in options;
		const skipOptionsExists = isObject(options) && 'skip' in options;
		if (takeOptionsExists && options.take && options.take > max) {
			throw new UserInputError('errors.list_query_limit_exceeded', {
				limit: max,
			});
		}
		const skip = skipOptionsExists ? Math.max(options.skip ?? 0, 0) : 0;
		// take mustn't be -ve and must be < max
		let take: number = max;
		if (takeOptionsExists && options.take == null) {
			take = max;
		} else if (takeOptionsExists && options.take) {
			take = Math.min(Math.max(options.take, 0), max);
		}

		if (
			skipOptionsExists &&
			options.skip !== undefined &&
			takeOptionsExists &&
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
