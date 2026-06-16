import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
	DataSource,
	EntityManager,
	EntitySchema,
	FindManyOptions,
	FindOneOptions,
	ObjectLiteral,
	ObjectType,
	Repository,
} from 'typeorm';
import { RequestContext } from '../api/request-context/request-context';
import { TRANSACTION_MANAGER_KEY } from '../common/constants/keys';
import { EntityNotFoundError } from '../common/errors/errors';
import { AppEntity } from '../common/helpers/app-entity';
import { ClassType } from '../common/types/class-type';
import { MarketplaceRegionAware } from '../common/types/marketplace-region-aware';

type EntityTarget<Entity extends ObjectLiteral> = string | ObjectType<Entity> | EntitySchema<Entity>;
interface GetEntityOrThrowOptions<Entity = any> extends FindOneOptions<Entity> {
	marketplaceRegionId?: string;
	retriesCount?: number;
	retryDelay?: number;
	includeSoftDeleted?: boolean;
}

@Injectable()
export class OrmService {
	constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

	public get dataSource(): DataSource {
		return this._dataSource;
	}

	public getRepository<Entity extends ObjectLiteral>(
		requestContext: RequestContext,
		target: EntityTarget<Entity>,
	): Repository<Entity> {
		const entityManager = (requestContext as any)[TRANSACTION_MANAGER_KEY] as EntityManager | undefined;

		if (entityManager) {
			const repo = entityManager.getRepository(target);
			if (repo) return repo;
			return this.dataSource.getRepository(target);
		}
		return this.dataSource.getRepository(target);
	}

	public async getEntityOrThrow<Entity extends AppEntity>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		id: string,
		options: GetEntityOrThrowOptions<Entity> = {},
	): Promise<Entity> {
		const { retryDelay = 25, retriesCount } = options;
		if (!retriesCount || retriesCount <= 0) {
			return await this._getEntityOrThrow(ctx, entityType, id, options);
		} else {
			let err: any;

			const retriesInt = Math.ceil(retriesCount);
			const delay = Math.ceil(Math.max(retryDelay, 1));
			for (let attempt = 0; attempt < retriesInt; attempt++) {
				try {
					const result = await this._getEntityOrThrow(ctx, entityType, id, options);
					return result;
				} catch (error) {
					err = error;
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
			throw err;
		}
	}

	private async _getEntityOrThrow<Entity extends AppEntity>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		id: string,
		options: GetEntityOrThrowOptions<Entity> = {},
	): Promise<Entity> {
		let entity: Entity | undefined;
		if (options.marketplaceRegionId) {
			entity = await this.findOneInMarketplace(
				ctx,
				entityType as unknown as ClassType<AppEntity & MarketplaceRegionAware>,
				id,
				options.marketplaceRegionId,
				options as FindOneOptions,
			);
		} else {
			const optionsWithId = {
				...options,
				where: {
					...(options.where || {}),
					id,
				},
			} as FindOneOptions<Entity>;
			entity = await this.getRepository(ctx, entityType)
				.findOne(optionsWithId)
				.then((entity) => entity ?? undefined);
		}

		if (!entity || ('deletedAt' in entity && entity.deletedAt !== null && !options.includeSoftDeleted)) {
			throw new EntityNotFoundError({
				entityName: entityType.name as any,
				entityId: id,
			});
		}

		return entity;
	}

	public async findOneInMarketplace<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		id: string,
		marketplaceId: string,
		options: FindOneOptions<Entity> = {},
	): Promise<Entity | undefined> {
		const qb = this.getRepository(ctx, entityType).createQueryBuilder('entity');

		qb.setFindOptions({
			relationLoadStrategy: 'query',
			...options,
		});

		qb.leftJoin('entity.marketplaceRegions', 'mpr')
			.andWhere('entity.id = :id', {
				id,
			})
			.andWhere('mpr.id = :marketplaceId', {
				marketplaceId,
			});

		return await qb.getOne().then((result) => {
			return result ?? undefined;
		});
	}

	public async findByIdsInMarketplace<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entity: ClassType<Entity>,
		ids: string[],
		marketplaceId: string,
		options: FindManyOptions<Entity>,
	): Promise<Array<Entity>> {
		if (!ids.length) return Promise.resolve([]);

		const qb = this.getRepository(ctx, entity).createQueryBuilder('entity');
		qb.setFindOptions({
			relationLoadStrategy: 'query',
			...options,
		});

		qb.leftJoin('entity.marketplaceRegions', 'mpr')
			.andWhere('entity.id IN (:...ids)', {
				ids,
			})
			.andWhere('mpr.id = :marketplaceId', {
				marketplaceId,
			});

		return await qb.getMany();
	}
}
