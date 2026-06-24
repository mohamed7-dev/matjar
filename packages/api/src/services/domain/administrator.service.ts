import {
	CreateAdministratorInput,
	DeletionResponse,
	DeletionResult,
	UpdateAdministratorInput,
} from '@matjar/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import { In, IsNull } from 'typeorm';
import { RelationPaths } from '../../api/decorators/relations.decorator';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError, InternalServerError, UserInputError } from '../../common/errors/errors';
import { UserPermissionsMap } from '../../common/helpers/user-permissions-map';
import { ListQueryOptions } from '../../common/types/list-query-options';
import { PaginatedList } from '../../common/types/paginated-list';
import { assertPromise } from '../../common/utils/assert-promise';
import { normalizeInput } from '../../common/utils/normalize-input';
import { ConfigService } from '../../config/config.service';
import { Administrator } from '../../entities/administrator/administrator.entity';
import { NativeAuthenticationMethod } from '../../entities/authentication-method/native-authentication-method.entity';
import { Role } from '../../entities/role/role.entity';
import { User } from '../../entities/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { AdministratorEvent } from '../../event-bus/events/administrator-event';
import { RoleChangeEvent } from '../../event-bus/events/role-change-event';
import { OrmService } from '../../orm/orm.service';
import { patchEntity } from '../../orm/utils/patch-entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { PasswordHashingService } from '../helpers/password-hashing.service';
import { RequestContextService } from '../helpers/request-context.service';
import { RoleService } from './role.service';
import { UserService } from './user.service';

@Injectable()
export class AdministratorService {
	constructor(
		private readonly ormService: OrmService,
		private readonly configService: ConfigService,
		private readonly roleService: RoleService,
		private readonly userService: UserService,
		private readonly requestContextService: RequestContextService,
		private readonly eventBus: EventBus,
		private readonly passwordHashingService: PasswordHashingService,
		private readonly listQueryBuilder: ListQueryBuilder,
	) {}

	/**@internal */
	public async initAdministrators(): Promise<void> {
		await this.initializeSuperAdmin();
	}

	public async findOne(
		ctx: RequestContext,
		id: string,
		relations?: RelationPaths<Administrator>,
	): Promise<Administrator | undefined> {
		const admin = await this.ormService.getRepository(ctx, Administrator).findOne({
			where: {
				id,
			},
			relations: relations
				? relations
				: [
						'user',
						'user.roles',
					],
		});

		return admin ?? undefined;
	}

	public async findAll(
		ctx: RequestContext,
		listQueryOptions?: ListQueryOptions<Administrator>,
		relations?: RelationPaths<Administrator>,
	): Promise<PaginatedList<Administrator>> {
		return await this.listQueryBuilder
			.build(Administrator, listQueryOptions, {
				relations: relations ?? [
					'user',
					'user.roles',
				],
				where: {
					deletedAt: IsNull(),
				},
				ctx,
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({
				items,
				totalItemsCount: totalItems,
			}));
	}

	public async getOneByUserId(
		userId: string,
		ctx?: RequestContext,
		relations?: any,
	): Promise<Administrator | undefined> {
		const repo = ctx
			? this.ormService.getRepository(ctx, Administrator)
			: this.ormService.dataSource.getRepository(Administrator);
		return (
			(await repo.findOne({
				relations: relations
					? relations
					: {
							user: {
								roles: true,
							},
						},
				where: {
					user: {
						id: userId,
					},
					deletedAt: IsNull(),
				},
			})) ?? undefined
		);
	}

	public async createAdministrator(
		ctx: RequestContext,
		input: CreateAdministratorInput,
	): Promise<Administrator> {
		// check if current user (assigner) is allowed to assign roles
		await this.checkAssignerCanAssignRoles(ctx, input.roleIds);

		// validate identifier conflict
		const normalizedIdentifier = normalizeInput(input.identifier);
		await this.checkIdentifierConflict(ctx, normalizedIdentifier);

		const administrator = new Administrator(input);
		administrator.identifier = normalizedIdentifier;
		administrator.user = await this.userService.createAdministratorUser(ctx, {
			identifier: normalizedIdentifier,
			password: input.password,
		});
		let createdAdmin = await this.ormService.getRepository(ctx, Administrator).save(administrator);
		// assign roles
		for (const roleId of input.roleIds) {
			createdAdmin = await this.assignRoleToAdministrator(ctx, createdAdmin.id, roleId);
		}
		await this.eventBus.publish(new AdministratorEvent(ctx, createdAdmin, 'created', input));
		return createdAdmin;
	}

	public async updateAdministrator(
		ctx: RequestContext,
		input: UpdateAdministratorInput,
	): Promise<Administrator> {
		const administrator = await this.ormService.getEntityOrThrow(ctx, Administrator, input.id, {
			relations: [
				'user',
				'user.roles',
			],
		});

		if (input.roleIds) {
			await this.checkAssignerCanAssignRoles(ctx, input.roleIds);
		}

		if (input.identifier) {
			// normalize identifier and check conflict
			const normalizedIdentifier = normalizeInput(input.identifier);
			await this.checkIdentifierConflict(ctx, normalizedIdentifier, input.id);
			input.identifier = normalizedIdentifier;
		}

		let updatedAdmin = patchEntity(administrator, input);
		await this.ormService.getRepository(ctx, Administrator).save(updatedAdmin);

		// update user entity credentials
		if (input.identifier) {
			updatedAdmin.user.identifier = input.identifier;
			await this.ormService.getRepository(ctx, User).save(updatedAdmin.user);
		}

		if (input.password) {
			const user = await this.userService.getUserById(ctx, administrator.user.id);
			if (user) {
				const nativeAuthMethod = user.getNativeAuthenticationMethod();
				nativeAuthMethod.password = await this.passwordHashingService.hash(input.password);
				await this.ormService.getRepository(ctx, NativeAuthenticationMethod).save(nativeAuthMethod);
			}
		}

		if (input.roleIds) {
			const isSuperAdmin = await this.isTheOnlySuperAdmin(ctx, input.id);
			if (isSuperAdmin) {
				const superAdminRole = await this.roleService.getSuperAdminRole(ctx);
				if (!input.roleIds.some((roleId) => roleId === superAdminRole.id)) {
					throw new InternalServerError('errors.super_admin-must-have-super_admin-role');
				}
			}

			administrator.user.roles = [];
			await this.ormService.getRepository(ctx, User).save(administrator.user, {
				reload: false,
			});

			const removeIds = administrator.user.roles
				.map((role) => role.id)
				.filter((roleId) => (input.roleIds as string[]).indexOf(roleId) === -1);

			const addIds = input.roleIds.filter(
				(roleId) => !administrator.user.roles.some((role) => role.id === roleId),
			);

			for (const roleId of input.roleIds) {
				updatedAdmin = await this.assignRoleToAdministrator(ctx, administrator.id, roleId);
			}
			await this.eventBus.publish(new RoleChangeEvent(ctx, updatedAdmin, addIds, 'assigned'));
			await this.eventBus.publish(new RoleChangeEvent(ctx, updatedAdmin, removeIds, 'removed'));
		}

		await this.eventBus.publish(new AdministratorEvent(ctx, updatedAdmin, 'updated', input));
		return updatedAdmin;
	}

	public async deleteAdministrators(
		ctx: RequestContext,
		administratorIds: string[],
	): Promise<DeletionResponse[]> {
		const administrators = await Promise.all(
			administratorIds.map((administratorId) =>
				this.ormService.getEntityOrThrow(ctx, Administrator, administratorId, {
					relations: [
						'user',
					],
				}),
			),
		);

		return await Promise.all(
			administrators.map(async (administrator) => {
				const isSuperAdmin = await this.isTheOnlySuperAdmin(ctx, administrator.id);
				if (isSuperAdmin) {
					throw new InternalServerError('errors.cannot_delete_sole_super_admin');
				}
				await this.ormService.getRepository(ctx, Administrator).update(
					{
						id: administrator.id,
					},
					{
						deletedAt: new Date(),
					},
				);
				await this.userService.softDeleteUser(ctx, administrator.user.id);
				await this.eventBus.publish(
					new AdministratorEvent(ctx, administrator, 'deleted', administrator.id),
				);
				return {
					result: DeletionResult.DELETED,
				};
			}),
		);
	}

	public async assignRoleToAdministrator(
		ctx: RequestContext,
		administratorId: string,
		roleId: string,
	): Promise<Administrator> {
		const administrator = await this.findOne(ctx, administratorId);
		if (!administrator) {
			throw new EntityNotFoundError({
				entityName: 'Administrator',
				entityId: administratorId,
			});
		}
		const role = await this.roleService.findOne(ctx, roleId);
		if (!role || role.company) {
			throw new EntityNotFoundError({
				entityName: 'Role',
				entityId: roleId,
			});
		}
		administrator.user.roles.push(role);
		await this.ormService.getRepository(ctx, User).save(administrator.user, {
			reload: false,
		});
		return administrator;
	}

	/**
	 * @description
	 * Only true if the administrator id resolves to only one administrator with superAdmin power
	 */
	private async isTheOnlySuperAdmin(ctx: RequestContext, id: string): Promise<boolean> {
		const superAdminRole = await this.roleService.getSuperAdminRole(ctx);
		const superAdmins = await this.ormService.getRepository(ctx, Administrator).find({
			relations: [
				'user',
				'user.roles',
			],
			where: {
				deletedAt: IsNull(),
				user: {
					roles: {
						id: superAdminRole.id,
					},
				},
			},
		});

		if (superAdmins.length === 0) return false;

		if (superAdmins.length > 1) return false;

		return id === superAdmins[0].id;
	}

	private async checkIdentifierConflict(
		ctx: RequestContext,
		identifier: string,
		excludeId?: string,
	): Promise<void> {
		const foundAdmin = await this.ormService.getRepository(ctx, Administrator).findOne({
			where: {
				identifier,
				deletedAt: IsNull(),
			},
		});
		if (foundAdmin && (!excludeId || foundAdmin.id !== excludeId)) {
			throw new UserInputError('errors.email-address-already-exists-for-administrator');
		}
	}

	private async checkAssignerCanAssignRoles(ctx: RequestContext, roleIds: string[]): Promise<void> {
		const roles = await this.ormService.getRepository(ctx, Role).find({
			where: {
				id: In(roleIds),
			},
			relations: {
				marketplaceRegions: true,
			},
		});
		const userPermissionsMap = UserPermissionsMap.buildFromRoles(roles);
		for (const userPermissionsItem of UserPermissionsMap.list(userPermissionsMap)) {
			const hasAll = await this.roleService.userHasAllPermissionsOnMarketplace(
				ctx,
				userPermissionsItem.id,
				userPermissionsItem.permissions,
			);

			if (!hasAll) {
				throw new UserInputError('errors.active_user_does_not_have_sufficient_permissions');
			}
		}
	}

	private async initializeSuperAdmin(): Promise<void> {
		const { superAdminCredentials } = this.configService.auth;
		const foundSuperAdminUser = await this.ormService.dataSource.getRepository(User).findOne({
			where: {
				identifier: superAdminCredentials.identifier,
			},
		});

		if (foundSuperAdminUser) {
			const foundSuperAdmin = await this.ormService.dataSource.getRepository(Administrator).findOne({
				where: {
					user: {
						id: foundSuperAdminUser.id,
					},
				},
			});
			if (!foundSuperAdmin) {
				const admin = new Administrator({
					identifier: normalizeInput(superAdminCredentials.identifier),
					firstName: 'super',
					lastName: 'admin',
				});
				admin.user = foundSuperAdminUser;
				await this.ormService.dataSource.getRepository(Administrator).save(admin);
			} else if (foundSuperAdmin.deletedAt !== null) {
				foundSuperAdmin.deletedAt = null;
				await this.ormService.dataSource.getRepository(Administrator).save(foundSuperAdmin);
			}

			if (foundSuperAdminUser.deletedAt != null) {
				foundSuperAdminUser.deletedAt = null;
				await this.ormService.dataSource.getRepository(User).save(foundSuperAdminUser);
			}
		} else {
			const ctx = await this.requestContextService.create({
				apiType: 'admin',
			});
			const superAdminRole = await this.roleService.getSuperAdminRole();
			const createdAdminUser = await this.userService.createAdministratorUser(
				ctx,
				superAdminCredentials,
			);
			const administrator = new Administrator({
				identifier: normalizeInput(superAdminCredentials.identifier),
				firstName: 'super',
				lastName: 'admin',
			});
			administrator.user = createdAdminUser;
			const { id } = await this.ormService.getRepository(ctx, Administrator).save(administrator);
			const createdSuperAdmin = await assertPromise(this.findOne(ctx, id));

			createdSuperAdmin.user.roles.push(superAdminRole);
			await this.ormService.dataSource.getRepository(User).save(createdSuperAdmin?.user, {
				reload: false,
			});
		}
	}
}
