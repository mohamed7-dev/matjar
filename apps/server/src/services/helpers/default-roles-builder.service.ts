import {
	COMPANY_ADMIN_ROLE_CODE,
	COMPANY_ADMIN_ROLE_DESCRIPTION,
	CUSTOMER_ROLE_CODE,
	CUSTOMER_ROLE_DESCRIPTION,
	SUPER_ADMIN_ROLE_CODE,
	SUPER_ADMIN_ROLE_DESCRIPTION,
} from '@matjar/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import {
	getNormalizedCompanyAppPermissions,
	getNormalizedPlatformAppPermissions,
} from '../../api/common/default-permissions';

enum RoleScope {
	PLATFORM = 'PLATFORM',
	COMPANY = 'COMPANY',
}

interface RoleDefinition {
	permissions: string[]; // TODO: change permissions to enum type
	description: string;
	code: string;
}

export type DefaultRolesMap = Map<RoleScope, Map<string, RoleDefinition>>;

@Injectable()
export class DefaultRolesBuilderService {
	private defaultRolesDefinitions = new Map<RoleScope, Map<string, RoleDefinition>>();

	public build(): DefaultRolesMap {
		this.defaultRolesDefinitions = new Map();

		if (!this.defaultRolesDefinitions.has(RoleScope.PLATFORM)) {
			this.defaultRolesDefinitions.set(RoleScope.PLATFORM, new Map());
		}
		if (!this.defaultRolesDefinitions.has(RoleScope.COMPANY)) {
			this.defaultRolesDefinitions.set(RoleScope.COMPANY, new Map());
		}

		this.buildPlatformRoles();
		this.buildCompanyRoles();

		return this.defaultRolesDefinitions;
	}

	private buildPlatformRoles(): void {
		this.defaultRolesDefinitions.get(RoleScope.PLATFORM)?.set(SUPER_ADMIN_ROLE_CODE, {
			code: SUPER_ADMIN_ROLE_CODE,
			permissions: this.getAssignablePlatformSuperAdminPermissions(),
			description: SUPER_ADMIN_ROLE_DESCRIPTION,
		});

		this.defaultRolesDefinitions.get(RoleScope.PLATFORM)?.set(CUSTOMER_ROLE_CODE, {
			code: CUSTOMER_ROLE_CODE,
			permissions: [],
			description: CUSTOMER_ROLE_DESCRIPTION,
		});
	}

	private buildCompanyRoles(): void {
		this.defaultRolesDefinitions.get(RoleScope.COMPANY)?.set(COMPANY_ADMIN_ROLE_CODE, {
			code: COMPANY_ADMIN_ROLE_CODE,
			permissions: this.getAssignableOrgOwnerPermissions(),
			description: COMPANY_ADMIN_ROLE_DESCRIPTION,
		});
	}

	public getAllDefaultRolesFlattened(scope?: RoleScope): RoleDefinition[] {
		if (scope) {
			return Array.from(this.defaultRolesDefinitions.get(scope)?.values() ?? []);
		}
		return Array.from(this.defaultRolesDefinitions.values()).flatMap((roleMap) =>
			Array.from(roleMap.values()),
		);
	}

	public getDefaultRolesCodes(scope?: RoleScope): string[] {
		if (scope) {
			return Array.from(this.defaultRolesDefinitions.get(scope)?.values() ?? []).map(
				(item) => item.code,
			);
		}
		return this.getAllDefaultRolesFlattened().map((item) => item.code);
	}

	public getDefaultRoleDefinitionByCode(code: string): RoleDefinition | undefined {
		return this.getAllDefaultRolesFlattened().find((item) => item.code === code);
	}

	private getAssignablePlatformSuperAdminPermissions(): string[] {
		const allPermissions = getNormalizedPlatformAppPermissions();
		return allPermissions.filter((p) => p.assignable && p.scope === RoleScope.PLATFORM).map((p) => p.key);
	}

	private getAssignableOrgOwnerPermissions(): string[] {
		const allPermissions = getNormalizedCompanyAppPermissions();
		return allPermissions.filter((p) => p.assignable && p.scope === RoleScope.COMPANY).map((p) => p.key);
	}
}
