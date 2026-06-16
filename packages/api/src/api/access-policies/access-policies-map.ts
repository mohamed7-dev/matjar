import { AuthenticatedPolicy } from './authenticated.policy';
import { PublicPolicy } from './public.policy';
import { UserHasPermissionOnMarketplacePolicy } from './user-has-permission-on-marketplace.policy';

export const accessPoliciesMap = {
	PublicPolicy,
	AuthenticatedPolicy,
	UserHasPermissionOnMarketplacePolicy,
};

export type AccessPoliciesUnion = keyof typeof accessPoliciesMap;
