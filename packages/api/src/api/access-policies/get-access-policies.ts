import { accessPoliciesMap } from './access-policies-map';
import { AccessPolicy } from './access-policy.interface';

let cachedPolicies: AccessPolicy[];

export function getAllAccessPolicies(): AccessPolicy[] {
	const policies = Object.values(accessPoliciesMap);
	if (cachedPolicies?.length === policies?.length) {
		return cachedPolicies;
	}
	cachedPolicies = policies.map((Policy) => {
		return new Policy();
	});
	return cachedPolicies;
}
