import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { assertPromise } from '../../common/utils/assert-promise';
import { normalizeInput } from '../../common/utils/normalize-input';
import { ConfigService } from '../../config/config.service';
import { Administrator } from '../../entities/administrator/administrator.entity';
import { User } from '../../entities/user/user.entity';
import { OrmService } from '../../orm/orm.service';
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
	) {}

	/**@internal */
	public async initAdministrators(): Promise<void> {
		await this.initializeSuperAdmin();
	}

	// TODO: change any to more appropriate type based on the Entity type
	public async getOne(
		ctx: RequestContext,
		id: string,
		relations?: any,
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

	public async initializeSuperAdmin(): Promise<void> {
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
			const createdSuperAdmin = await assertPromise(this.getOne(ctx, id));

			createdSuperAdmin.user.roles.push(superAdminRole);
			await this.ormService.dataSource.getRepository(User).save(createdSuperAdmin?.user, {
				reload: false,
			});
		}
	}
}
