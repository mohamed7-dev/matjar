import { AuthenticatedPolicy } from './authenticated.policy';
import { PublicPolicy } from './public.policy';

export const accessPoliciesMap = {
	PublicPolicy,
	AuthenticatedPolicy,
};

export type AccessPoliciesUnion = keyof typeof accessPoliciesMap;
