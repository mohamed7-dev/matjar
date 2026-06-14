import { Permission } from '@matjar/common/lib/generated-types';
import { Injector } from '../../common/helpers/injector';
import { RequestContext } from '../request-context/request-context';
import { AccessPolicy } from './access-policy.interface';

export interface UserHasPermissionsOnCurrentMarketplacePolicyOptions {
	permissions: Permission;
}

export class UserHasPermissionsOnCurrentMarketplacePolicy implements AccessPolicy {
	private roleService: import('../../services/domain/role.service').RoleService;
	private config: UserHasPermissionsOnCurrentMarketplacePolicyOptions;

	async onInit(injector: Injector): Promise<void> {
		const { RoleService } = await import('../../services/domain/role.service.js');
		this.roleService = injector.get(RoleService);
	}

	withConfig(
		options: UserHasPermissionsOnCurrentMarketplacePolicyOptions,
	): UserHasPermissionsOnCurrentMarketplacePolicy {
		const instance = new UserHasPermissionsOnCurrentMarketplacePolicy();
		instance.roleService = this.roleService;
		instance.config = options;
		return instance;
	}

	async evaluate(context: RequestContext): Promise<boolean> {
		// TODO: use role service to check current user permissions on channel
		return true;
	}
}
