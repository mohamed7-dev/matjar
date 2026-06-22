import {
	CreateRoleInput,
	DeletionResponse,
	DeletionResult,
	Permission,
	RemoveRoleFromMarketplaceRegionsInput,
	Success,
	UpdateRoleInput,
} from '@matjar/common/lib/generated-types';
import {
	COMPANY_ADMIN_ROLE_CODE,
	CUSTOMER_ROLE_CODE,
	SUPER_ADMIN_ROLE_CODE,
} from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import {
	getNormalizedCompanyAppPermissions,
	getNormalizedPlatformAppPermissions,
} from '../../api/common/default-permissions';
import { RelationPaths } from '../../api/decorators/relations.decorator';
import { RequestContext } from '../../api/request-context/request-context';
import { Cache } from '../../cache/cache';
import { CacheService } from '../../cache/cache.service';
import {
	CompanyMarketplaceMembershipError,
	EntityNotFoundError,
	ForbiddenError,
	InternalServerError,
	UserInputError,
} from '../../common/errors/errors';
import { RoleCodeConflictError } from '../../common/errors/generated-graphql-admin-errors';
import { UserPermissionsMap, type UserPermissionsMapType } from '../../common/helpers/user-permissions-map';
import { ListQueryOptions } from '../../common/types/list-query-options';
import { PaginatedList } from '../../common/types/paginated-list';
import { assertPromise } from '../../common/utils/assert-promise';
import { filterUnique } from '../../common/utils/filter-unique';
import { Company } from '../../entities/company/company.entity';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { Role } from '../../entities/role/role.entity';
import { User } from '../../entities/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { RoleEvent } from '../../event-bus/events/role-event';
import { OrmService } from '../../orm/orm.service';
import { patchEntity } from '../../orm/utils/patch-entity';
import { DefaultRolesBuilderService } from '../helpers/default-roles-builder.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { RequestContextService } from '../helpers/request-context.service';
import { MarketplaceRegionService } from './marketplace-region.service';

@Injectable()
export class RoleService {
	private rolesCacheKey = 'RoleService.allRoles';
	private rolesCache: Cache;

	constructor(
		private readonly ormService: OrmService,
		private readonly defaultRolesBuilder: DefaultRolesBuilderService,
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly requestContextService: RequestContextService,
		private readonly eventBus: EventBus,
		private readonly cacheService: CacheService,
		private readonly listQueryBuilder: ListQueryBuilder,
	) {
		this.defaultRolesBuilder.build();
		this.rolesCache = this.cacheService.createCache({
			generateKey: (scope) => `${this.rolesCacheKey}:${scope}`,
			entryOptions: {
				ttlInMs: 1000 * 60 * 60, // 1 hour
			},
		});

		// listen to the RoleEvent and clear the cache if there is any mutation
		// done on the data
		this.eventBus.ofType(RoleEvent).subscribe((event) => {
			this.rolesCache.removeBulk(event.entity?.company ? event.entity?.company?.id : '*');
		});
	}

	/**@internal */
	public async initRoles(): Promise<void> {
		await this.initializeSuperAdminRole();
		await this.initializeCustomerRole();
		await this.initializeCompanyAdminRole();
	}

	public async createRole(
		ctx: RequestContext,
		input: CreateRoleInput,
	): Promise<Role | RoleCodeConflictError> {
		const companyId = ctx.companyId;
		// check permissions are valid
		this.checkPermissionsValidity(input.permissions, companyId);

		// get the company
		let company: Company | undefined;
		if (companyId) {
			company = ctx.company;
		}

		// make sure marketplaces exists, and user has permission to create role on these marketplaces
		let targetMarketplaces: Array<MarketplaceRegion>;
		if (input.marketplaceRegionIds?.length) {
			targetMarketplaces = await this.getTargetMarketplaces(
				ctx,
				input.marketplaceRegionIds,
				companyId
					? [
							Permission.company_role_create,
						]
					: [
							Permission.platform_role_create,
						],
				company?.id,
			);
		} else {
			targetMarketplaces = [
				ctx.marketplaceRegion,
			];
		}

		// validate the company marketplace membership
		if (targetMarketplaces?.length && company) {
			await this.validateCompanyMarketplacesMembership(
				ctx,
				targetMarketplaces.map((mp) => mp.id),
				company,
			);
		}

		// make sure that active user has sufficient permissions to assign
		await this.checkAssignerHasSufficientPermissions(ctx, targetMarketplaces, input.permissions, company);

		// make sure that company+code are unique while system roles are always unique
		const foundRole = await this.getRoleByCode(ctx, input.code, company?.id);
		if (foundRole) {
			return new RoleCodeConflictError();
		}

		// create the role
		const role = new Role({
			code: input.code,
			description: input.description,
			permissions: filterUnique(input.permissions),
			isSystem: false,
		});
		if (company) {
			role.company = company;
		}
		role.marketplaceRegions = targetMarketplaces;
		const savedRole = await this.ormService.getRepository(ctx, Role).save(role);
		// publish the event
		await this.eventBus.publish(new RoleEvent(ctx, savedRole, 'created', input));
		// return role
		return savedRole;
	}

	public async updateRole(
		ctx: RequestContext,
		input: UpdateRoleInput,
	): Promise<Role | RoleCodeConflictError> {
		const companyId = ctx.companyId;

		// check permissions are valid
		this.checkPermissionsValidity(input.permissions ?? [], companyId);

		const role = await this.ormService.getEntityOrThrow(ctx, Role, input.id, {
			relations: [
				'marketplaceRegions',
				'company',
			],
		});

		if (role.isSystem) {
			throw new InternalServerError('errors.cannot_modify_role', {
				roleCode: role.code,
			});
		}

		if (companyId) {
			// prevents anyone who stole the role id from updating the role
			this.checkCurrentCompanyOwnsRoles(ctx, [
				role,
			]);
		}

		// get the company
		let company: Company | undefined;
		if (companyId) {
			company = ctx.company;
		}

		// retrieve target marketplaces
		const targetMarketplaces = input.marketplaceRegionIds
			? await this.getTargetMarketplaces(
					ctx,
					input.marketplaceRegionIds,
					companyId
						? [
								Permission.company_role_update,
							]
						: [
								Permission.platform_role_update,
							],
					company?.id,
				)
			: undefined;

		const affectedMarketplaces = targetMarketplaces
			? this.getAffectedMarketplaces(role.marketplaceRegions, targetMarketplaces)
			: role.marketplaceRegions;

		// validate the company marketplace membership
		if (affectedMarketplaces?.length && company) {
			await this.validateCompanyMarketplacesMembership(
				ctx,
				affectedMarketplaces.map((mp) => mp.id),
				company,
			);
		}

		if (input.permissions) {
			await this.checkAssignerHasSufficientPermissions(
				ctx,
				affectedMarketplaces,
				input.permissions,
				company,
			);
		}

		if (input.code) {
			// make sure that company+code are unique while system roles are always unique
			const foundRole = await this.getRoleByCode(ctx, input.code, companyId);
			if (foundRole && foundRole.id !== role.id) {
				return new RoleCodeConflictError();
			}
		}

		patchEntity(role, {
			code: input.code,
			description: input.description,
			permissions: input.permissions ? filterUnique(input.permissions) : undefined,
		});

		if (affectedMarketplaces) {
			role.marketplaceRegions = affectedMarketplaces;
		}

		if (company) {
			role.company = company;
		}

		await this.ormService.getRepository(ctx, Role).save(role, {
			reload: false,
		});

		const updatedRole = await assertPromise(this.findOne(ctx, role.id));
		await this.eventBus.publish(new RoleEvent(ctx, updatedRole, 'updated', input));
		return updatedRole;
	}

	// needs testing in multi-marketplace env
	public async removeRoleFromMarketplaceRegions(
		ctx: RequestContext,
		input: RemoveRoleFromMarketplaceRegionsInput,
	): Promise<Success> {
		const role = await this.ormService.getEntityOrThrow(ctx, Role, input.id, {
			relations: [
				'marketplaceRegions',
				'company',
			],
		});

		const roleCompanyId = role.company?.id;

		const targetMarketplaces = await this.getTargetMarketplaces(
			ctx,
			input.marketplaceRegionIds,
			roleCompanyId
				? [
						Permission.company_role_update,
					]
				: [
						Permission.platform_role_update,
					],
			roleCompanyId,
		);

		if (targetMarketplaces.length) {
			const marketplaces = role.marketplaceRegions.filter(
				(mpr) => !targetMarketplaces.some((tmp) => tmp.id === mpr.id),
			);

			role.marketplaceRegions = marketplaces;
			const updatedRole = await this.ormService.getRepository(ctx, Role).save(role);
			await this.eventBus.publish(new RoleEvent(ctx, updatedRole, 'updated', input));

			return {
				success: true,
			};
		}

		return {
			success: false,
		};
	}

	public async deleteRoles(ctx: RequestContext, ids: string[]): Promise<DeletionResponse[]> {
		const companyId = ctx.companyId;
		const roles = await Promise.all(
			ids.map((id) =>
				this.ormService.getEntityOrThrow(ctx, Role, id, {
					relations: [
						'company',
					],
				}),
			),
		);

		if (companyId) {
			// prevents anyone who stole the role id from delete the roles
			this.checkCurrentCompanyOwnsRoles(ctx, roles);
		}
		return await Promise.all(
			roles.map(async (role) => {
				if (role.isSystem) {
					throw new InternalServerError('errors.cannot_delete_role', {
						roleCode: role.code,
					});
				}
				const deletedRole = new Role(role);
				await this.ormService.getRepository(ctx, Role).remove(role);
				await this.eventBus.publish(new RoleEvent(ctx, deletedRole, 'deleted', role.id));
				return {
					result: DeletionResult.DELETED,
				};
			}),
		);
	}

	public async findOne(
		ctx: RequestContext,
		roleId: string,
		relations?: RelationPaths<Role>,
	): Promise<Role | undefined> {
		const role = await this.ormService
			.getRepository(ctx, Role)
			.findOne({
				where: {
					id: roleId,
				},
				relations: filterUnique([
					...(relations ?? []),
					'marketplaceRegions',
					'company',
				]),
			})
			.then((result) => result ?? undefined);

		// TODO: check if the current user can read the role

		if (role && !(await this.checkActiveUserCanReadRole(ctx, role))) {
			return undefined;
		}

		if (ctx.companyId && role?.company) {
			this.checkCurrentCompanyOwnsRoles(ctx, [
				role,
			]);
		}

		return role;
	}

	public async findAll(
		ctx: RequestContext,
		listQueryOptions?: ListQueryOptions<Role>,
		relations?: RelationPaths<Role>,
	): Promise<PaginatedList<Role>> {
		const companyId = ctx.companyId;

		const storedRoles = await this.rolesCache.getOrInsert(companyId ? companyId : '*', async () => {
			const roles = await this.ormService.getRepository(ctx, Role).find({
				where: companyId
					? {
							company: {
								id: companyId,
							},
						}
					: {},
				relations: [
					'marketplaceRegions',
					'company',
				],
			});
			return JSON.stringify(roles);
		});

		const roles = JSON.parse(storedRoles);

		const accessibleRoleIds: string[] = [];
		for (const role of roles) {
			if (await this.checkActiveUserCanReadRole(ctx, role)) {
				accessibleRoleIds.push(role.id);
			}
		}

		if (accessibleRoleIds.length === 0) {
			return {
				items: [],
				totalItemsCount: 0,
			};
		}

		const [items, totalItems] = await this.listQueryBuilder
			.build(Role, listQueryOptions, {
				relations: filterUnique([
					...(relations ?? []),
					'marketplaceRegions',
					'company',
				]),
				ctx,
			})
			.andWhere({
				id: In(accessibleRoleIds),
			})
			.getManyAndCount();

		return {
			items,
			totalItemsCount: totalItems,
		};
	}

	private async checkActiveUserCanReadRole(ctx: RequestContext, role: Role): Promise<boolean> {
		const permissionsMap = UserPermissionsMap.buildFromRoles([
			role,
		]);

		for (const mapItem of UserPermissionsMap.list(permissionsMap)) {
			let activeUserHasRequiredPermissions = false;
			if (mapItem.scope === 'company') {
				activeUserHasRequiredPermissions = await this.userHasAllPermissionsOnMarketplace(
					ctx,
					mapItem.marketplaceRegionId,
					mapItem.permissions,
					mapItem.id,
				);
			} else {
				activeUserHasRequiredPermissions = await this.userHasAllPermissionsOnMarketplace(
					ctx,
					mapItem.id,
					mapItem.permissions,
				);
			}

			if (!activeUserHasRequiredPermissions) {
				return false;
			}
		}
		return true;
	}

	private checkCurrentCompanyOwnsRoles(ctx: RequestContext, roles: Role[]): void {
		for (const role of roles) {
			if (role.company?.id !== ctx.companyId) {
				throw new ForbiddenError();
			}
		}
	}

	private async getRoleByCode(
		ctx: RequestContext | undefined,
		code: string,
		companyId?: string,
	): Promise<Role | undefined> {
		const repository = ctx
			? this.ormService.getRepository(ctx, Role)
			: this.ormService.dataSource.getRepository(Role);

		const qb = repository.createQueryBuilder('role');

		qb.where('role.code = :roleCode', {
			roleCode: code,
		});

		if (companyId) {
			qb.innerJoin('role.company', 'company').andWhere('role.company = :companyId', {
				companyId,
			});
		}

		return await qb.getOne().then((result) => result ?? undefined);
	}

	private async checkAssignerHasSufficientPermissions(
		ctx: RequestContext,
		targetMarketplaces: MarketplaceRegion[],
		permissions: Permission[],
		company?: Company,
	): Promise<void> {
		const userPermissionsMap = await this.getActiveUserPermissionsMap(ctx);

		for (const marketplace of targetMarketplaces) {
			let hasAllPermissions: boolean = false;
			if (company) {
				hasAllPermissions = UserPermissionsMap.hasAll(
					userPermissionsMap,
					{
						companyId: company.id,
						marketplaceRegionId: marketplace.id,
					},
					permissions,
				);
			} else {
				hasAllPermissions = UserPermissionsMap.hasAll(
					userPermissionsMap,
					{
						marketplaceRegionId: marketplace.id,
					},
					permissions,
				);
			}

			if (!hasAllPermissions) {
				throw new UserInputError('errors.active_user_does_not_have_sufficient_permissions');
			}
		}
	}

	private async validateCompanyMarketplacesMembership(
		ctx: RequestContext,
		marketplaceRegionIds: string[],
		company: Company,
	): Promise<void> {
		if (!company || !marketplaceRegionIds.length) {
			return;
		}

		const repo = ctx
			? this.ormService.getRepository(ctx, Company)
			: this.ormService.dataSource.getRepository(Company);

		if (!company.marketplaceRegions.length) {
			const companyWithMarketplaces = await repo
				.createQueryBuilder('company')
				.innerJoin('company.marketplaceRegions', 'marketplace')
				.where('company.id = :companyId', {
					companyId: company.id,
				})
				.andWhere('marketplace.id IN (:...marketplaceRegionIds)', {
					marketplaceRegionIds,
				})
				.getOne();

			company.marketplaceRegions = companyWithMarketplaces?.marketplaceRegions ?? [];
		}

		const belongsToCompany = marketplaceRegionIds.every((marketplaceRegionId) => {
			return company?.marketplaceRegions.some((region) => region.id === marketplaceRegionId);
		});

		if (!belongsToCompany) {
			throw new CompanyMarketplaceMembershipError({
				companyCode: company.code,
			});
		}
	}

	private checkPermissionsValidity(permissions?: Permission[], companyId?: string): void {
		if (!permissions?.length) return;

		const { platformPermissions, companyPermissions } = this.getAllAssignablePermissions();

		permissions.forEach((p) => {
			let shouldThrow = false;
			if (companyId) {
				const includesPlatformPermission = platformPermissions.includes(p);
				const notIncludedInCompanyPermissions = !companyPermissions.includes(p);
				shouldThrow = includesPlatformPermission || notIncludedInCompanyPermissions;
			} else {
				const notIncludedInPlatformPermissions = !platformPermissions.includes(p);
				shouldThrow = notIncludedInPlatformPermissions;
			}

			if (shouldThrow) {
				throw new UserInputError('errors.invalid_permission', {
					permission: p,
				});
			}
		});
	}

	private async getTargetMarketplaces(
		ctx: RequestContext,
		marketplacesRegionIds: string[],
		requiredPermissions: Permission[],
		companyId?: string,
	): Promise<Array<MarketplaceRegion>> {
		const repo = this.ormService.getRepository(ctx, MarketplaceRegion);

		const marketplaces = await repo.find({
			where: {
				id: In(marketplacesRegionIds),
			},
		});

		if (marketplaces.length !== marketplacesRegionIds.length) {
			throw new EntityNotFoundError({
				entityName: 'MarketplaceRegion',
				entityId: marketplacesRegionIds
					.filter((mprId) => !marketplaces.some((mp) => mp.id === mprId))
					.join(','),
			});
		}

		const permissionsMap = await this.getActiveUserPermissionsMap(ctx);
		for (const marketplaceId of marketplacesRegionIds) {
			const allowed = UserPermissionsMap.hasAll(
				permissionsMap,
				{
					...(companyId
						? {
								companyId,
							}
						: null),
					marketplaceRegionId: marketplaceId,
				},
				requiredPermissions,
			);

			if (!allowed) {
				throw new ForbiddenError();
			}
		}

		return marketplaces;
	}

	private getAffectedMarketplaces(
		existing: MarketplaceRegion[],
		requested: MarketplaceRegion[],
	): MarketplaceRegion[] {
		const map = new Map<string, MarketplaceRegion>();

		for (const mp of existing) {
			map.set(mp.id, mp);
		}

		for (const mp of requested) {
			map.set(mp.id, mp);
		}

		return [
			...map.values(),
		];
	}

	private getAllAssignablePermissions(): {
		platformPermissions: Permission[];
		companyPermissions: Permission[];
		all: Permission[];
	} {
		const platformPermissions = getNormalizedPlatformAppPermissions()
			.filter((p) => p.assignable)
			.map((p) => p.key as Permission);

		const companyPermissions = getNormalizedCompanyAppPermissions()
			.filter((p) => p.assignable)
			.map((p) => p.key as Permission);

		return {
			platformPermissions,
			companyPermissions,
			all: [
				...platformPermissions,
				...companyPermissions,
			],
		};
	}

	public async getSuperAdminRole(ctx?: RequestContext): Promise<Role> {
		const repo = ctx
			? this.ormService.getRepository(ctx, Role)
			: this.ormService.dataSource.getRepository(Role);

		const superAdminRole = await repo.findOne({
			where: {
				code: SUPER_ADMIN_ROLE_CODE,
			},
		});

		if (!superAdminRole) {
			throw new InternalServerError('errors.missing_super_admin_role');
		}

		return superAdminRole;
	}

	public async getCustomerRole(ctx?: RequestContext): Promise<Role> {
		const repo = ctx
			? this.ormService.getRepository(ctx, Role)
			: this.ormService.dataSource.getRepository(Role);

		const customerRole = await repo.findOne({
			where: {
				code: CUSTOMER_ROLE_CODE,
			},
		});

		if (!customerRole) {
			throw new InternalServerError('errors.missing_customer_role');
		}

		return customerRole;
	}

	public async getCompanyAdminRole(ctx?: RequestContext): Promise<Role> {
		const repo = ctx
			? this.ormService.getRepository(ctx, Role)
			: this.ormService.dataSource.getRepository(Role);

		const companyAdminRole = await repo.findOne({
			where: {
				code: COMPANY_ADMIN_ROLE_CODE,
			},
		});

		if (!companyAdminRole) {
			throw new InternalServerError('errors.missing_company_admin_role');
		}

		return companyAdminRole;
	}

	/**
	 * @description
	 * Returns true if the user has the specified permission on the specified marketplace
	 *
	 * :::info
	 * the checking process could be scoped to a specific company by passing the optional companyId
	 * :::
	 */
	public async userHasPermissionOnMarketplace(
		ctx: RequestContext,
		marketplaceId: string,
		permission: Permission,
		companyId?: string,
	): Promise<boolean> {
		return this.userHasAnyPermissionsOnMarketplace(
			ctx,
			marketplaceId,
			[
				permission,
			],
			companyId,
		);
	}

	/**
	 * @description
	 * Returns true if the user has any of the specified permissions on the specified marketplace
	 *
	 * :::info
	 * the checking process could be scoped to a specific company by passing the optional companyId
	 * :::
	 */
	public async userHasAnyPermissionsOnMarketplace(
		ctx: RequestContext,
		marketplaceId: string,
		permissions: Permission[],
		companyId?: string,
	): Promise<boolean> {
		const userPermissionsMap = await this.getActiveUserPermissionsMap(ctx);
		if (
			UserPermissionsMap.hasAny(
				userPermissionsMap,
				{
					marketplaceRegionId: marketplaceId,
					companyId,
				},
				permissions,
			)
		) {
			return true;
		}

		return false;
	}

	/**
	 * @description
	 * Returns true if the user has all specified permissions on the specified marketplace
	 *
	 * :::info
	 * the checking process could be scoped to a specific company by passing the optional companyId
	 * :::
	 */
	public async userHasAllPermissionsOnMarketplace(
		ctx: RequestContext,
		marketplaceId: string,
		permissions: Permission[],
		companyId?: string,
	): Promise<boolean> {
		const userPermissionsMap = await this.getActiveUserPermissionsMap(ctx);
		if (
			UserPermissionsMap.hasAll(
				userPermissionsMap,
				{
					marketplaceRegionId: marketplaceId,
					companyId,
				},
				permissions,
			)
		) {
			return true;
		}

		return false;
	}

	private async getActiveUserPermissionsMap(ctx: RequestContext): Promise<UserPermissionsMapType> {
		if (ctx.activeUserId == null) return new Map();

		const user = await this.ormService.getEntityOrThrow(ctx, User, ctx.activeUserId, {
			relations: [
				'roles',
				'roles.marketplaceRegions',
				'roles.company',
			],
		});

		const userPermissionsMap = UserPermissionsMap.build(user);
		return userPermissionsMap;
	}

	private async initializeSuperAdminRole(): Promise<void> {
		const superAdminDefinition =
			this.defaultRolesBuilder.getDefaultRoleDefinitionByCode(SUPER_ADMIN_ROLE_CODE);

		try {
			const superAdminRole = await this.getSuperAdminRole();
			superAdminRole.permissions = [
				...(superAdminDefinition?.permissions ?? []),
			];
			await this.ormService.dataSource.getRepository(Role).save(superAdminRole);
		} catch {
			const ctx = await this.requestContextService.create({
				apiType: 'admin',
			});
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion(ctx);
			const role = new Role({
				code: superAdminDefinition?.code,
				description: superAdminDefinition?.description,
				permissions: [
					...(superAdminDefinition?.permissions ?? []),
				],
				isSystem: true,
			});

			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];

			await this.ormService.dataSource.getRepository(Role).save(role);
		}
	}

	private async initializeCustomerRole(): Promise<void> {
		const customerRoleDefinition =
			this.defaultRolesBuilder.getDefaultRoleDefinitionByCode(CUSTOMER_ROLE_CODE);

		try {
			await this.getCustomerRole();
		} catch {
			const ctx = await this.requestContextService.create({
				apiType: 'admin',
			});
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion(ctx);

			const role = new Role({
				code: customerRoleDefinition?.code,
				description: customerRoleDefinition?.description,
				permissions: [
					...(customerRoleDefinition?.permissions ?? []),
				],
				isSystem: true,
			});

			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];

			await this.ormService.dataSource.getRepository(Role).save(role);
		}
	}

	private async initializeCompanyAdminRole(): Promise<void> {
		const companyAdminRoleDefinition =
			this.defaultRolesBuilder.getDefaultRoleDefinitionByCode(COMPANY_ADMIN_ROLE_CODE);

		try {
			const companyAdminRole = await this.getCompanyAdminRole();
			companyAdminRole.permissions = [
				...(companyAdminRoleDefinition?.permissions ?? []),
			];
			await this.ormService.dataSource.getRepository(Role).save(companyAdminRole);
		} catch {
			const ctx = await this.requestContextService.create({
				apiType: 'admin',
			});
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion(ctx);

			const role = new Role({
				code: companyAdminRoleDefinition?.code,
				description: companyAdminRoleDefinition?.description,
				permissions: [
					...(companyAdminRoleDefinition?.permissions ?? []),
				],
				isSystem: true,
			});

			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];

			await this.ormService.dataSource.getRepository(Role).save(role);
		}
	}
}
