import { Permission, PermissionIndexItemType } from '@matjar/common/lib/generated-types';
import { CompanyRole } from '../../entities/role/company-role.entity';
import { PlatformRole } from '../../entities/role/platform-role.entity';
import { User } from '../../entities/user/user.entity';

type AccessContextKey =
	| `platform:${string}` // marketplace only
	| `company:${string}:${string}`; // marketplace + company

interface PermissionIndexMapItem {
	type: PermissionIndexItemType;
	marketplaceToken: string;
	marketplaceCode: string;
	companyToken?: string;
	companyCode?: string;
	permissions: Set<Permission>;
}

interface NormalizedPermissionIndexItem {
	type: PermissionIndexItemType;
	marketplaceToken: string;
	marketplaceCode: string;
	companyToken?: string;
	companyCode?: string;
	permissions: Permission[];
}

export type PermissionsIndexMap = Map<AccessContextKey, PermissionIndexMapItem>;

type RoleBinding = {
	type: PermissionIndexItemType;
	companyId?: string;
	marketplaceRegionId: string;
};

export class PermissionsIndex {
	public static dummy(): PermissionsIndexMap {
		return new Map();
	}

	static build(user: User): PermissionsIndexMap {
		const index: PermissionsIndexMap = new Map();

		for (const role of user.roles) {
			for (const marketplace of role.marketplaceRegions) {
				if (role instanceof PlatformRole) {
					const key = PermissionsIndex.buildKey({
						type: PermissionIndexItemType.PLATFORM,
						marketplaceRegionId: marketplace.id,
					});

					if (!index.has(key)) {
						index.set(key, {
							permissions: new Set(),
						} as any);
					}

					const foundIndexItem = index.get(key);
					if (foundIndexItem) {
						foundIndexItem.type = PermissionIndexItemType.PLATFORM;
						foundIndexItem.marketplaceToken = marketplace.token;
						foundIndexItem.marketplaceCode = marketplace.code;
						foundIndexItem.permissions = new Set([
							...(foundIndexItem.permissions ?? []),
							...(role.permissions ?? []),
						]);
					}
				}

				if (role instanceof CompanyRole) {
					const key = PermissionsIndex.buildKey({
						type: PermissionIndexItemType.PLATFORM,
						marketplaceRegionId: marketplace.id,
						companyId: role.company.id,
					});

					if (!index.has(key)) {
						index.set(key, {
							permissions: new Set(),
						} as any);
					}

					const foundIndexItem = index.get(key);
					if (foundIndexItem) {
						foundIndexItem.type === PermissionIndexItemType.COMPANY;
						foundIndexItem.marketplaceToken = marketplace.token;
						foundIndexItem.marketplaceCode = marketplace.code;
						foundIndexItem.companyCode = role.company.code;
						foundIndexItem.companyToken = role.company.token;
						foundIndexItem.permissions = new Set([
							...(foundIndexItem.permissions ?? []),
							...(role.permissions ?? []),
						]);
					}
				}
			}
		}

		return index;
	}

	static has(index: PermissionsIndexMap, roleBinding: RoleBinding, permissions: Permission[]): boolean {
		const foundIndexItem = index.get(PermissionsIndex.buildKey(roleBinding));

		if (!foundIndexItem) return false;

		return permissions.some((p) => foundIndexItem.permissions.has(p));
	}

	static hasAll(index: PermissionsIndexMap, roleBinding: RoleBinding, permissions: Permission[]): boolean {
		const foundIndexItem = index.get(PermissionsIndex.buildKey(roleBinding));

		if (!foundIndexItem) return false;

		return permissions.every((p) => foundIndexItem.permissions.has(p));
	}

	static normalizeMap(index: PermissionsIndexMap): NormalizedPermissionIndexItem[] {
		return Array.from(index.values()).map((item) => {
			return {
				...item,
				permissions: Array.from(item.permissions.values()),
			};
		});
	}

	private static buildKey(binding: RoleBinding): AccessContextKey {
		if (binding.type === 'COMPANY') {
			return `company:${binding.marketplaceRegionId}:${binding.companyId}`;
		}

		return `platform:${binding.marketplaceRegionId}`;
	}
}
