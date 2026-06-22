import { Permission } from '@matjar/common/lib/generated-types';
import { Role } from '../../entities/role/role.entity';
import { User } from '../../entities/user/user.entity';
import { filterUnique } from '../utils/filter-unique';

type RoleBinding = {
	companyId?: string;
	marketplaceRegionId: string;
};

type UserPermissionsMapKey = `marketplace:${string}` | `company:${string}:${string}`;

export type UserPermissionsMapItem =
	| {
			scope: 'marketplace';
			id: string;
			token: string;
			code: string;
			permissions: Permission[];
			marketplaceRegionId?: undefined;
	  }
	| {
			scope: 'company';
			id: string;
			token: string;
			code: string;
			permissions: Permission[];
			marketplaceRegionId: string;
	  };

/**
 * @description
 * the map key represents a Company id or a MarketplaceRegion id
 */
export type UserPermissionsMapType = Map<UserPermissionsMapKey, UserPermissionsMapItem>;

export class UserPermissionsMap {
	public static dummy(): UserPermissionsMapType {
		return new Map();
	}

	public static buildFromRoles(roles: Role[]): UserPermissionsMapType {
		return UserPermissionsMap._build(roles);
	}

	public static build(user: User): UserPermissionsMapType {
		return UserPermissionsMap._build(user.roles);
	}

	private static _build(roles: Role[]): UserPermissionsMapType {
		const map: UserPermissionsMapType = new Map();

		for (const role of roles) {
			for (const marketplace of role.marketplaceRegions) {
				const key = UserPermissionsMap.buildKey({
					marketplaceRegionId: marketplace.id,
					companyId: role.company?.id,
				});

				let item = map.get(key);

				if (!item) {
					item = role.company
						? {
								scope: 'company',
								id: role.company.id,
								token: role.company.token,
								code: role.company.code,
								marketplaceRegionId: marketplace.id,
								permissions: [],
							}
						: {
								scope: 'marketplace',
								id: marketplace.id,
								token: marketplace.token,
								code: marketplace.code,
								permissions: [],
							};

					map.set(key, item);
				}

				item.permissions = filterUnique([
					...item.permissions,
					...role.permissions,
				]);
			}
		}

		return map;
	}

	static hasAny(
		map: UserPermissionsMapType,
		roleBinding: RoleBinding,
		requiredPermissions: Permission[],
	): boolean {
		const permissions = UserPermissionsMap.resolvePermissions(map, roleBinding);

		for (const permission of requiredPermissions) {
			if (permissions.includes(permission)) {
				return true; // OR semantics (any match)
			}
		}

		return false;
	}

	static list(map: UserPermissionsMapType): UserPermissionsMapItem[] {
		return Array.from(map.values());
	}

	static hasAll(
		map: UserPermissionsMapType,
		roleBinding: RoleBinding,
		requiredPermissions: Permission[],
	): boolean {
		const permissions = UserPermissionsMap.resolvePermissions(map, roleBinding);
		return requiredPermissions.every((p) => permissions.includes(p)); // AND semantics (all match)
	}

	private static resolvePermissions(map: UserPermissionsMapType, roleBinding: RoleBinding): Permission[] {
		let permissions: Permission[] = [];
		if (roleBinding.marketplaceRegionId && roleBinding.companyId) {
			// the request came in the context of company (b2b), this means that
			// we have to check the user permissions on this company
			permissions =
				map.get(`company:${roleBinding.companyId}:${roleBinding.marketplaceRegionId}`)?.permissions ??
				[];
		} else if (roleBinding.marketplaceRegionId && !roleBinding.companyId) {
			// the request came in the context of marketplace only (admin, b2b, or b2c), this means that
			// we have to check the user permissions on this marketplace no matter the user type
			permissions = map.get(`marketplace:${roleBinding.marketplaceRegionId}`)?.permissions ?? [];
		}
		return permissions;
	}

	private static buildKey(binding: RoleBinding): UserPermissionsMapKey {
		if (binding.companyId && binding.marketplaceRegionId) {
			return `company:${binding.companyId}:${binding.marketplaceRegionId}`;
		}

		return `marketplace:${binding.marketplaceRegionId}`;
	}
}
