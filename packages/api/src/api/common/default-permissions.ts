import {
	CrudPermission,
	NormalizedPermission,
	ResourcePermission,
	RoleScope,
} from '../../common/helpers/permissions-factory';

export const DEFAULT_PLATFORM_PERMISSIONS = [
	new CrudPermission('Administrator', RoleScope.PLATFORM),
	new CrudPermission('Company', RoleScope.PLATFORM),
	new CrudPermission('Role', RoleScope.PLATFORM),
	new CrudPermission('Marketplace_Region', RoleScope.PLATFORM),
	new CrudPermission('Catalog', RoleScope.PLATFORM),
	new CrudPermission('Asset', RoleScope.PLATFORM),
	new CrudPermission('Order', RoleScope.PLATFORM),
];

export const DEFAULT_COMPANY_PERMISSIONS = [
	new ResourcePermission('Company', RoleScope.COMPANY, [
		'read',
	]),
	new CrudPermission('Order', RoleScope.COMPANY),
	new CrudPermission('Role', RoleScope.COMPANY),
];

export function getNormalizedPlatformAppPermissions(): NormalizedPermission[] {
	return DEFAULT_PLATFORM_PERMISSIONS.reduce((acc, curr) => {
		return [
			...acc,
			...curr.normalizePermission(),
		];
	}, [] as NormalizedPermission[]);
}

export function getNormalizedCompanyAppPermissions(): NormalizedPermission[] {
	return DEFAULT_COMPANY_PERMISSIONS.reduce((acc, curr) => {
		return [
			...acc,
			...curr.normalizePermission(),
		];
	}, [] as NormalizedPermission[]);
}
