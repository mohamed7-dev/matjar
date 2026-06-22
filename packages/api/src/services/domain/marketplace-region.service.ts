import { CreateMarketplaceRegionInput, CurrencyCode } from '@matjar/common/lib/generated-types';
import { DEFAULT_MARKETPLACE_REGION_CODE } from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError, MarketplaceRegionNotFoundError } from '../../common/errors/errors';
import { AppEntity } from '../../common/helpers/app-entity';
import { ClassType } from '../../common/types/class-type';
import { ListQueryOptions } from '../../common/types/list-query-options';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { PaginatedList } from '../../common/types/paginated-list';
import { filterUnique } from '../../common/utils/filter-unique';
import { ConfigService } from '../../config/config.service';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { EventBus } from '../../event-bus/event-bus';
import { ChangeMarketplaceRegionEvent } from '../../event-bus/events/change-marketplace-region-event';
import { MarketplaceRegionEvent } from '../../event-bus/events/marketplace-region-event';
import { OrmService } from '../../orm/orm.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

@Injectable()
export class MarketplaceRegionService {
	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
		private readonly eventBus: EventBus,
		private readonly listQueryBuilder: ListQueryBuilder,
	) {}

	/**@internal */
	public async initMarketplaceRegions(): Promise<void> {
		await this.initializeDefaultMarketplaceRegion();
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

		await this.eventBus.publish(new MarketplaceRegionEvent(ctx, savedMarketplace, 'created', input));

		return savedMarketplace;
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
		let defaultMarketplaceRegion: MarketplaceRegion | null;
		if (ctx) {
			defaultMarketplaceRegion = await this.ormService.getRepository(ctx, MarketplaceRegion).findOne({
				where: {
					code: DEFAULT_MARKETPLACE_REGION_CODE,
				},
			});
		} else {
			defaultMarketplaceRegion = await this.ormService.dataSource
				.getRepository(MarketplaceRegion)
				.findOne({
					where: {
						code: DEFAULT_MARKETPLACE_REGION_CODE,
					},
				});
		}

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

		if (!token) {
			return await this.getDefaultMarketplaceRegion(ctx);
		}

		let marketplaceRegion: MarketplaceRegion | null;

		if (!ctx) {
			marketplaceRegion = await this.ormService.dataSource.getRepository(MarketplaceRegion).findOne({
				where: {
					token: token,
				},
			});
		} else {
			marketplaceRegion = await this.ormService.getRepository(ctx, MarketplaceRegion).findOne({
				where: {
					token: token,
				},
			});
		}

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
