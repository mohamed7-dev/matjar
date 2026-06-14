import { AuthenticatedPolicy } from './authenticated.policy';
import { PublicPolicy } from './public.policy';
import { UserHasPermissionsOnCurrentMarketplacePolicy } from './user-has-permissions-on-current-marketplace.policy';

export const accessPoliciesMap = {
	PublicPolicy,
	AuthenticatedPolicy,
	UserHasPermissionsOnCurrentMarketplacePolicy,
};

export type AccessPoliciesUnion = keyof typeof accessPoliciesMap;
