import { CrudPermission, NormalizedPermission, RoleScope } from '../../common/helpers/permissions-factory';

export const DEFAULT_PLATFORM_PERMISSIONS = [
	new CrudPermission('Administrator', RoleScope.PLATFORM),
];

export const DEFAULT_COMPANY_PERMISSIONS = [
	new CrudPermission('Administrator', RoleScope.COMPANY),
];

export function getNormalizedPlatformAppPermissions(): NormalizedPermission[] {
	return DEFAULT_PLATFORM_PERMISSIONS.reduce((acc, curr) => {
		return [
			// biome-ignore lint/performance/noAccumulatingSpread: we must accumulate the result
			...acc,
			...curr.normalizePermission(),
		];
	}, [] as NormalizedPermission[]);
}

export function getNormalizedCompanyAppPermissions(): NormalizedPermission[] {
	return DEFAULT_COMPANY_PERMISSIONS.reduce((acc, curr) => {
		return [
			// biome-ignore lint/performance/noAccumulatingSpread: we must accumulate the result
			...acc,
			...curr.normalizePermission(),
		];
	}, [] as NormalizedPermission[]);
}
