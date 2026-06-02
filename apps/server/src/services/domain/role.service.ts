import {
	COMPANY_ADMIN_ROLE_CODE,
	CUSTOMER_ROLE_CODE,
	SUPER_ADMIN_ROLE_CODE,
} from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError } from '../../common/errors/errors';
import { PlatformRole } from '../../entities/role/platform-role.entity';
import { Role } from '../../entities/role/role.entity';
import { OrmService } from '../../orm/orm.service';
import { DefaultRolesBuilderService } from '../helpers/default-roles-builder.service';
import { MarketplaceRegionService } from './marketplace-region.service';

@Injectable()
export class RoleService {
	constructor(
		private readonly ormService: OrmService,
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly defaultRolesBuilder: DefaultRolesBuilderService,
	) {
		this.defaultRolesBuilder.build();
	}

	/**@internal */
	public async initRoles(): Promise<void> {
		await this.initializeSuperAdminRole();
		await this.initializeCustomerRole();
		await this.initializeCompanyAdminRole();
	}

	public async getSuperAdminRole(ctx?: RequestContext): Promise<PlatformRole> {
		let superAdminRole: Role | null;
		if (ctx) {
			superAdminRole = await this.ormService.getRepository(ctx, PlatformRole).findOne({
				where: {
					code: SUPER_ADMIN_ROLE_CODE,
				},
			});
		} else {
			superAdminRole = await this.ormService.dataSource.getRepository(PlatformRole).findOne({
				where: {
					code: SUPER_ADMIN_ROLE_CODE,
				},
			});
		}

		if (!superAdminRole) {
			throw new InternalServerError('errors.missing_super_admin_role');
		}

		return superAdminRole;
	}

	public async getCustomerRole(ctx?: RequestContext): Promise<PlatformRole> {
		let customerRole: Role | null;
		if (ctx) {
			customerRole = await this.ormService.getRepository(ctx, PlatformRole).findOne({
				where: {
					code: CUSTOMER_ROLE_CODE,
				},
			});
		} else {
			customerRole = await this.ormService.dataSource.getRepository(PlatformRole).findOne({
				where: {
					code: CUSTOMER_ROLE_CODE,
				},
			});
		}

		if (!customerRole) {
			throw new InternalServerError('errors.missing_customer_role');
		}

		return customerRole;
	}

	public async getCompanyAdminRole(ctx?: RequestContext): Promise<PlatformRole> {
		let companyAdminRole: Role | null;
		if (ctx) {
			companyAdminRole = await this.ormService.getRepository(ctx, PlatformRole).findOne({
				where: {
					code: COMPANY_ADMIN_ROLE_CODE,
				},
			});
		} else {
			companyAdminRole = await this.ormService.dataSource.getRepository(PlatformRole).findOne({
				where: {
					code: COMPANY_ADMIN_ROLE_CODE,
				},
			});
		}

		if (!companyAdminRole) {
			throw new InternalServerError('errors.missing_company_admin_role');
		}

		return companyAdminRole;
	}

	private async initializeSuperAdminRole(): Promise<void> {
		const superAdminDefinition =
			this.defaultRolesBuilder.getDefaultRoleDefinitionByCode(SUPER_ADMIN_ROLE_CODE);

		try {
			const superAdminRole = await this.getSuperAdminRole();
			superAdminRole.permissions = [
				...(superAdminDefinition?.permissions ?? []),
			];
			await this.ormService.dataSource.getRepository(PlatformRole).save(superAdminRole);
		} catch {
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion();
			const role = new PlatformRole({
				code: superAdminDefinition?.code,
				description: superAdminDefinition?.description,
				permissions: [
					...(superAdminDefinition?.permissions ?? []),
				],
			});
			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];
			await this.ormService.dataSource.getRepository(PlatformRole).save(role);
		}
	}

	private async initializeCustomerRole(): Promise<void> {
		const customerRoleDefinition =
			this.defaultRolesBuilder.getDefaultRoleDefinitionByCode(CUSTOMER_ROLE_CODE);

		try {
			await this.getCustomerRole();
		} catch {
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion();
			const role = new PlatformRole({
				code: customerRoleDefinition?.code,
				description: customerRoleDefinition?.description,
				permissions: [
					...(customerRoleDefinition?.permissions ?? []),
				],
			});
			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];
			await this.ormService.dataSource.getRepository(PlatformRole).save(role);
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
			await this.ormService.dataSource.getRepository(PlatformRole).save(companyAdminRole);
		} catch {
			const defaultMarketplaceRegion =
				await this.marketplaceRegionService.getDefaultMarketplaceRegion();
			const role = new PlatformRole({
				code: companyAdminRoleDefinition?.code,
				description: companyAdminRoleDefinition?.description,
				permissions: [
					...(companyAdminRoleDefinition?.permissions ?? []),
				],
			});
			role.marketplaceRegions = [
				defaultMarketplaceRegion,
			];
			await this.ormService.dataSource.getRepository(PlatformRole).save(role);
		}
	}
}
