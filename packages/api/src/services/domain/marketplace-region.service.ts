import {
	CreateMarketplaceRegionInput,
	CurrencyCode,
	DeletionResponse,
	DeletionResult,
	UpdateMarketplaceRegionInput,
} from '@matjar/common/lib/generated-types';
import { DEFAULT_MARKETPLACE_REGION_CODE } from '@matjar/common/lib/shared-constants';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import {
	InternalServerError,
	MarketplaceRegionNotFoundError,
	UserInputError,
} from '../../common/errors/errors';
import { AppEntity } from '../../common/helpers/app-entity';
import {
	createSelfRefreshingCache,
	SelfRefreshingCacheApi,
} from '../../common/helpers/self-refreshing-cache';
import { ClassType } from '../../common/types/class-type';
import { ListQueryOptions } from '../../common/types/list-query-options';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { PaginatedList } from '../../common/types/paginated-list';
import { assertPromise } from '../../common/utils/assert-promise';
import { filterUnique } from '../../common/utils/filter-unique';
import { ConfigService } from '../../config/config.service';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { EventBus } from '../../event-bus/event-bus';
import { ChangeMarketplaceRegionEvent } from '../../event-bus/events/change-marketplace-region-event';
import { MarketplaceRegionEvent } from '../../event-bus/events/marketplace-region-event';
import { OrmService } from '../../orm/orm.service';
import { patchEntity } from '../../orm/utils/patch-entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { RequestContextService } from '../helpers/request-context.service';

@Injectable()
export class MarketplaceRegionService {
	private marketplacesSelfRefreshingCache: SelfRefreshingCacheApi<
		MarketplaceRegion[],
		[
			RequestContext,
		]
	>;
	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
		private readonly eventBus: EventBus,
		private readonly listQueryBuilder: ListQueryBuilder,
		@Inject(forwardRef(() => RequestContextService))
		private readonly requestContextService: RequestContextService,
	) {}

	/**@internal */
	public async initMarketplaceRegions(): Promise<void> {
		await this.initializeDefaultMarketplaceRegion();
		await this.cacheMarketplaceRegions();
	}

	public async createMarketplaceRegion(
		ctx: RequestContext,
		input: CreateMarketplaceRegionInput,
	): Promise<MarketplaceRegion> {
		const marketplace = new MarketplaceRegion({
			code: input.code,
			token: input.token,
			primaryLanguageCode: input.primaryLanguageCode,
			availableLanguageCodes: input.availableLanguageCodes ?? [
				input.primaryLanguageCode,
			],
			primaryCurrencyCode: input.primaryCurrencyCode,
			availableCurrencyCodes:
				input.availableCurrencyCodes ??
				(input.primaryCurrencyCode
					? [
							input.primaryCurrencyCode,
						]
					: []),
		});

		const savedMarketplace = await this.ormService
			.getRepository(ctx, MarketplaceRegion)
			.save(marketplace);

		await this.marketplacesSelfRefreshingCache.refresh(ctx);

		await this.eventBus.publish(new MarketplaceRegionEvent(ctx, savedMarketplace, 'created', input));

		return savedMarketplace;
	}

	public async updateMarketplaceRegion(
		ctx: RequestContext,
		input: UpdateMarketplaceRegionInput,
	): Promise<MarketplaceRegion> {
		const marketplaceRegion = await this.ormService.getEntityOrThrow(ctx, MarketplaceRegion, input.id);
		const updatedMarketplace = patchEntity(marketplaceRegion, input);
		if (input.primaryCurrencyCode) {
			updatedMarketplace.availableCurrencyCodes = filterUnique([
				...updatedMarketplace.availableCurrencyCodes,
				updatedMarketplace.primaryCurrencyCode,
			]);
		}

		// if the availableCurrencyCodes in the input doesn't include the primaryCurrencyCode
		// we should throw an error
		if (
			input.availableCurrencyCodes &&
			!updatedMarketplace.availableCurrencyCodes.includes(updatedMarketplace.primaryCurrencyCode)
		) {
			throw new UserInputError('errors.available_currency_codes_must_include_primary', {
				primaryCurrencyCode: updatedMarketplace.primaryCurrencyCode,
			});
		}

		await this.ormService.getRepository(ctx, MarketplaceRegion).save(updatedMarketplace);

		await this.marketplacesSelfRefreshingCache.refresh(ctx);

		await this.eventBus.publish(new MarketplaceRegionEvent(ctx, marketplaceRegion, 'updated', input));

		return await assertPromise(this.findOne(ctx, marketplaceRegion.id));
	}

	public async deleteMarketplaceRegions(ctx: RequestContext, ids: string[]): Promise<DeletionResponse[]> {
		const marketplaceRegions = await Promise.all(
			ids.map((id) => this.ormService.getEntityOrThrow(ctx, MarketplaceRegion, id)),
		);

		if (marketplaceRegions.some((mpr) => mpr.code === DEFAULT_MARKETPLACE_REGION_CODE)) {
			return [
				{
					result: DeletionResult.NOT_DELETED,
					message: ctx.t('errors.cannot_delete_default_marketplace'),
				},
			];
		}

		return await Promise.all(
			marketplaceRegions.map(async (mpr) => {
				const deletedMarketplace = new MarketplaceRegion(mpr);
				await this.ormService.getRepository(ctx, MarketplaceRegion).delete(mpr.id);
				await this.eventBus.publish(
					new MarketplaceRegionEvent(ctx, deletedMarketplace, 'deleted', mpr.id),
				);
				return {
					result: DeletionResult.DELETED,
				};
			}),
		);
	}

	public async findOne(ctx: RequestContext, id: string): Promise<MarketplaceRegion | undefined> {
		return await this.ormService
			.getRepository(ctx, MarketplaceRegion)
			.findOne({
				where: {
					id,
				},
			})
			.then((result) => result ?? undefined);
	}

	public async findAll(
		ctx: RequestContext,
		input: ListQueryOptions<MarketplaceRegion>,
	): Promise<PaginatedList<MarketplaceRegion>> {
		return await this.listQueryBuilder
			.build(MarketplaceRegion, input, {
				ctx,
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({
				items,
				totalItemsCount: totalItems,
			}));
	}

	public async getDefaultMarketplaceRegion(ctx?: RequestContext): Promise<MarketplaceRegion> {
		// sometimes we don't have the marketplace region token (e.g. when request comes with no token)
		// so we use code as the main query prop
		const allMarketplaces = await this.marketplacesSelfRefreshingCache.value(ctx as RequestContext);
		const defaultMarketplaceRegion = allMarketplaces.find(
			(channel) => channel.code === DEFAULT_MARKETPLACE_REGION_CODE,
		);

		if (!defaultMarketplaceRegion) {
			throw new InternalServerError('errors.default_marketplace_region_not_found');
		}
		return defaultMarketplaceRegion;
	}

	/**
	 * @description
	 * Retrieves marketplace region by the given token.
	 *
	 * :::warning
	 * throws {@link MarketplaceRegionNotFoundError} error if marketplace region isn't found
	 * :::
	 */
	async getMarketplaceRegionByToken(token: string): Promise<MarketplaceRegion>;
	async getMarketplaceRegionByToken(ctx: RequestContext, token: string): Promise<MarketplaceRegion>;
	public async getMarketplaceRegionByToken(
		ctxOrToken: RequestContext | string,
		maybeToken?: string,
	): Promise<MarketplaceRegion> {
		const token = !(ctxOrToken instanceof RequestContext) ? ctxOrToken : maybeToken;
		const ctx = ctxOrToken instanceof RequestContext ? ctxOrToken : undefined;

		const allMarketplaces = await this.marketplacesSelfRefreshingCache.value(ctx as RequestContext);

		if (allMarketplaces.length === 1 || !token) {
			return await this.getDefaultMarketplaceRegion(ctx);
		}

		const marketplaceRegion = allMarketplaces.find((mpr) => mpr.token === token);

		if (!marketplaceRegion) {
			throw new MarketplaceRegionNotFoundError(token);
		}

		return marketplaceRegion;
	}

	public async assignToActiveMarketplaceRegion<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entity: Entity,
	): Promise<Entity> {
		const defaultMarketplaceRegion = await this.getDefaultMarketplaceRegion(ctx);

		const marketplaceRegionsIds = filterUnique([
			defaultMarketplaceRegion.id,
			ctx.marketplaceRegionId,
		]);
		entity.marketplaceRegions = marketplaceRegionsIds.map((id) => ({
			id,
		})) as any;
		await this.eventBus.publish(
			new ChangeMarketplaceRegionEvent(
				ctx,
				entity,
				[
					ctx.marketplaceRegionId,
				],
				'assigned',
			),
		);
		return entity;
	}

	public async assignToMarketplaceRegions<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		entityId: string,
		marketplaceIds: string[],
	): Promise<Entity> {
		const entity = await this.ormService.getEntityOrThrow(ctx, entityType, entityId, {
			loadEagerRelations: false,
			relationLoadStrategy: 'query',
			where: {
				id: entityId,
			} as FindOptionsWhere<Entity>,
		});
		const entityMarketplaces = await this.getAssignedEntityMarketplaceRegions(ctx, entityType, entityId);
		const entityMarketplacesToAssign = marketplaceIds.filter(
			(id) => !entityMarketplaces.find((mp) => mp.marketplaceRegionId === id),
		);
		if (!entityMarketplacesToAssign.length) return entity;
		await this.ormService
			.getRepository(ctx, entityType)
			.createQueryBuilder()
			.relation('marketplaceRegions')
			.of(entity.id)
			.add(entityMarketplacesToAssign);

		await this.eventBus.publish(
			new ChangeMarketplaceRegionEvent(ctx, entity, entityMarketplacesToAssign, 'assigned', entityType),
		);
		return entity;
	}

	public async UnAssignFromMarketplaceRegion<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		id: string,
		marketplaceIds: string[],
	): Promise<Entity | undefined> {
		const entity = await this.ormService.getRepository(ctx, entityType).findOne({
			loadEagerRelations: false,
			relationLoadStrategy: 'query',
			where: {
				id: id,
			} as FindOptionsWhere<Entity>,
		});
		if (!entity) return undefined;
		const entityMarketplaces = await this.getAssignedEntityMarketplaceRegions(ctx, entityType, id);

		const entityMarketplacesToUnAssign = marketplaceIds.filter(
			(id) => !!entityMarketplaces.find((mp) => mp.marketplaceRegionId === id),
		);
		if (!entityMarketplacesToUnAssign.length) return undefined;
		await this.ormService
			.getRepository(ctx, entityType)
			.createQueryBuilder()
			.relation('marketplaceRegions')
			.of(entity.id)
			.remove(entityMarketplacesToUnAssign);
		await this.eventBus.publish(
			new ChangeMarketplaceRegionEvent(
				ctx,
				entity,
				entityMarketplacesToUnAssign,
				'removed',
				entityType,
			),
		);
		return entity;
	}

	private async getAssignedEntityMarketplaceRegions<Entity extends AppEntity & MarketplaceRegionAware>(
		ctx: RequestContext,
		entityType: ClassType<Entity>,
		entityId: string,
	): Promise<
		Array<{
			marketplaceRegionId: string;
		}>
	> {
		const repo = this.ormService.getRepository(ctx, entityType);
		const metadata = repo.metadata;
		const marketplaceRegionsRelation = metadata.findRelationWithPropertyPath('marketplaceRegions');
		if (!marketplaceRegionsRelation) {
			throw new InternalServerError(
				`Could not find the marketplaceRegions relation for entity ${metadata.name}`,
			);
		}
		const junctionTableName = marketplaceRegionsRelation.junctionEntityMetadata?.tableName;
		const junctionColumnName = marketplaceRegionsRelation.junctionEntityMetadata?.columns[0].databaseName;
		const inverseJunctionColumnName =
			marketplaceRegionsRelation.junctionEntityMetadata?.inverseColumns[0].databaseName;

		if (!junctionTableName || !junctionColumnName || !inverseJunctionColumnName) {
			throw new InternalServerError(
				`Could not find necessary join table information for the marketplaceRegions relation of entity ${metadata.name}`,
			);
		}
		return await this.ormService
			.getRepository(ctx, entityType)
			.manager.createQueryBuilder()
			.select(`junctionTable.${inverseJunctionColumnName}`, 'marketplaceRegionId')
			.from(junctionTableName, 'junctionTable')
			.where(`junctionTable.${junctionColumnName} = :entityId`, {
				entityId,
			})
			.execute();
	}

	private async cacheMarketplaceRegions(): Promise<void> {
		if (this.marketplacesSelfRefreshingCache) return;
		this.marketplacesSelfRefreshingCache = await this.createCache();
	}

	public async createCache(): Promise<
		SelfRefreshingCacheApi<
			MarketplaceRegion[],
			[
				RequestContext,
			]
		>
	> {
		const requestContext = await this.requestContextService.create(
			{
				apiType: 'admin',
			},
			true,
		);

		return createSelfRefreshingCache({
			name: 'MarketplaceRegionService.all',
			ttlInMs: 30_000,
			refresh: {
				fn: async (ctx: RequestContext) => {
					const result = await this.listQueryBuilder
						.build(
							MarketplaceRegion,
							{},
							{
								ctx,
								ignoreQueryLimits: true,
							},
						)
						.getManyAndCount()
						.then(([items, totalItems]) => ({
							items,
							totalItemsCount: totalItems,
						}));
					return result.items;
				},
				defaultArgs: [
					requestContext,
				],
			},
		});
	}

	private async initializeDefaultMarketplaceRegion(): Promise<void> {
		const { defaultMarketplaceRegionToken } = this.configService;

		let defaultMarketplaceRegion = await this.ormService.dataSource
			.getRepository(MarketplaceRegion)
			.findOne({
				where: {
					code: DEFAULT_MARKETPLACE_REGION_CODE,
				},
			});

		if (defaultMarketplaceRegion && defaultMarketplaceRegion.token !== defaultMarketplaceRegionToken) {
			defaultMarketplaceRegion.token = defaultMarketplaceRegionToken;
			await this.ormService.dataSource.getRepository(MarketplaceRegion).save(defaultMarketplaceRegion, {
				reload: false,
			});
		} else if (!defaultMarketplaceRegion) {
			defaultMarketplaceRegion = new MarketplaceRegion({
				code: DEFAULT_MARKETPLACE_REGION_CODE,
				token: defaultMarketplaceRegionToken,
				primaryCurrencyCode: CurrencyCode.USD,
				availableCurrencyCodes: [
					CurrencyCode.USD,
				],
				primaryLanguageCode: this.configService.defaultLanguageCode,
				availableLanguageCodes: [
					this.configService.defaultLanguageCode,
				],
			});
			await this.ormService.dataSource.getRepository(MarketplaceRegion).save(defaultMarketplaceRegion, {
				reload: false,
			});
		}
	}
}
