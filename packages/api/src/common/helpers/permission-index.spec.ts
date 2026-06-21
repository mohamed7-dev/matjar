import { Permission } from '@matjar/common/lib/generated-types';
import { describe, expect, it } from 'vitest';
import { Company } from '../../entities/company/company.entity';
import { MarketplaceRegion } from '../../entities/marketplace-region/marketplace-region.entity';
import { Role } from '../../entities/role/role.entity';
import { User } from '../../entities/user/user.entity';
import { UserPermissionsMap } from './user-permissions-map';

function createMarketplace(id: string, code: string): MarketplaceRegion {
	return {
		id,

		code,

		token: `token-${id}`,
	} as MarketplaceRegion;
}

function createCompany(id: string, code: string): Company {
	return {
		id,

		code,

		token: `company-${id}`,
	} as Company;
}

function createRole(input: {
	permissions: Permission[];

	marketplaces: MarketplaceRegion[];

	company?: Company;
}): Role {
	return {
		permissions: input.permissions,

		marketplaceRegions: input.marketplaces,

		company: input.company,
	} as Role;
}

function createUser(roles: Role[]): User {
	return {
		roles,
	} as User;
}

describe('UserPermissionsMap', () => {
	const egypt = createMarketplace('m1', 'EG');

	const ksa = createMarketplace('m2', 'KSA');

	const company = createCompany('c1', 'ACME');

	describe('build', () => {
		it('should aggregate marketplace permissions from multiple roles', () => {
			const role1 = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],
				marketplaces: [
					egypt,
				],
			});

			const role2 = createRole({
				permissions: [
					Permission.platform_catalog_update,
				],
				marketplaces: [
					egypt,
				],
			});

			const user = createUser([
				role1,
				role2,
			]);

			const map = UserPermissionsMap.build(user);

			const item = map.get(`marketplace:${egypt.id}`);

			expect(item).toBeDefined();
			expect(item?.permissions).toContain(Permission.platform_catalog_create);
			expect(item?.permissions).toContain(Permission.platform_catalog_update);
			expect(item?.permissions.length).toBe(2);
		});

		it('should remove duplicate permissions', () => {
			const role1 = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],

				marketplaces: [
					egypt,
				],
			});

			const role2 = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],

				marketplaces: [
					egypt,
				],
			});

			const user = createUser([
				role1,
				role2,
			]);

			const map = UserPermissionsMap.build(user);

			const item = map.get(`marketplace:${egypt.id}`);

			expect(item?.permissions).toEqual([
				Permission.platform_catalog_create,
			]);
		});

		it('should keep marketplace permissions isolated by marketplace', () => {
			const role1 = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],

				marketplaces: [
					egypt,
				],
			});

			const role2 = createRole({
				permissions: [
					Permission.platform_administrator_create,
				],

				marketplaces: [
					ksa,
				],
			});

			const user = createUser([
				role1,
				role2,
			]);

			const map = UserPermissionsMap.build(user);

			expect(map.get(`marketplace:${egypt.id}`)?.permissions).toEqual([
				Permission.platform_catalog_create,
			]);

			expect(map.get(`marketplace:${ksa.id}`)?.permissions).toEqual([
				Permission.platform_administrator_create,
			]);
		});

		it('should aggregate company permissions', () => {
			const role1 = createRole({
				company,

				permissions: [
					Permission.company_company_read,
				],

				marketplaces: [
					egypt,
				],
			});

			const role2 = createRole({
				company,

				permissions: [
					Permission.company_role_delete,
				],

				marketplaces: [
					egypt,
				],
			});

			const user = createUser([
				role1,
				role2,
			]);

			const map = UserPermissionsMap.build(user);

			const item = map.get(`company:${company.id}:${egypt.id}`);

			expect(item).toBeDefined();

			expect(item?.scope).toBe('company');

			expect(item?.permissions).toContain(Permission.company_company_read);

			expect(item?.permissions).toContain(Permission.company_role_delete);
		});
	});

	describe('hasAny', () => {
		it('should return true when user has at least one permission', () => {
			const role = createRole({
				permissions: [
					Permission.platform_catalog_delete,
				],

				marketplaces: [
					egypt,
				],
			});

			const map = UserPermissionsMap.build(
				createUser([
					role,
				]),
			);

			const result = UserPermissionsMap.hasAny(
				map,

				{
					marketplaceRegionId: egypt.id,
				},
				[
					Permission.platform_catalog_delete,
					Permission.platform_catalog_update,
				],
			);

			expect(result).toBe(true);
		});

		it('should return false when user has none of the permissions', () => {
			const role = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],

				marketplaces: [
					egypt,
				],
			});

			const map = UserPermissionsMap.build(
				createUser([
					role,
				]),
			);

			const result = UserPermissionsMap.hasAny(
				map,

				{
					marketplaceRegionId: egypt.id,
				},

				[
					Permission.platform_asset_delete,
					Permission.platform_asset_create,
				],
			);

			expect(result).toBe(false);
		});
	});

	describe('hasAll', () => {
		it('should return true when user has all permissions', () => {
			const role = createRole({
				permissions: [
					Permission.platform_catalog_create,
					Permission.platform_catalog_update,
				],

				marketplaces: [
					egypt,
				],
			});

			const map = UserPermissionsMap.build(
				createUser([
					role,
				]),
			);

			const result = UserPermissionsMap.hasAll(
				map,

				{
					marketplaceRegionId: egypt.id,
				},

				[
					Permission.platform_catalog_create,
					Permission.platform_catalog_update,
				],
			);

			expect(result).toBe(true);
		});

		it('should return false when user is missing one permission', () => {
			const role = createRole({
				permissions: [
					Permission.platform_catalog_create,
				],

				marketplaces: [
					egypt,
				],
			});

			const map = UserPermissionsMap.build(
				createUser([
					role,
				]),
			);

			const result = UserPermissionsMap.hasAll(
				map,

				{
					marketplaceRegionId: egypt.id,
				},

				[
					Permission.platform_catalog_create,
					Permission.platform_catalog_delete,
				],
			);

			expect(result).toBe(false);
		});

		it('should not leak company permissions between marketplaces', () => {
			const egyptRole = createRole({
				company,
				permissions: [
					Permission.platform_catalog_create,
				],
				marketplaces: [
					egypt,
				],
			});

			const ksaRole = createRole({
				company,
				permissions: [
					Permission.platform_asset_create,
				],
				marketplaces: [
					ksa,
				],
			});

			const map = UserPermissionsMap.build(
				createUser([
					egyptRole,
					ksaRole,
				]),
			);

			expect(
				UserPermissionsMap.hasAll(
					map,

					{
						companyId: company.id,
						marketplaceRegionId: egypt.id,
					},

					[
						Permission.platform_catalog_create,
					],
				),
			).toBe(true);

			expect(
				UserPermissionsMap.hasAll(
					map,

					{
						companyId: company.id,
						marketplaceRegionId: egypt.id,
					},

					[
						Permission.platform_asset_create,
					],
				),
			).toBe(false);
		});
	});
});
