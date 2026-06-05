import type { AccessPolicy } from './access-policy.interface';

export class PublicPolicy implements AccessPolicy {
	evaluate(): boolean {
		return true;
	}
}
