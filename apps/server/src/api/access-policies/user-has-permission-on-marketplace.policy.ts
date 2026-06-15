import { Permission } from '@matjar/common/lib/generated-types';
import { ExecutionContext } from '@nestjs/common';
import { Injector } from '../../common/helpers/injector';
import { RequestContext } from '../request-context/request-context';
import { parseContext } from '../utils/parse-context';
import { AccessPolicy } from './access-policy.interface';

export interface UserHasPermissionOnMarketplacePolicyOptions {
	permission: Permission;
	gqlMarketplaceIdArgsPath: string;
}

export class UserHasPermissionOnMarketplacePolicy implements AccessPolicy {
	private roleService: import('../../services/domain/role.service').RoleService;
	private config: UserHasPermissionOnMarketplacePolicyOptions;

	async onInit(injector: Injector): Promise<void> {
		const { RoleService } = await import('../../services/domain/role.service.js');
		this.roleService = injector.get(RoleService);
	}

	withConfig(options: UserHasPermissionOnMarketplacePolicyOptions): UserHasPermissionOnMarketplacePolicy {
		const instance = new UserHasPermissionOnMarketplacePolicy();
		instance.roleService = this.roleService;
		instance.config = options;
		return instance;
	}

	async evaluate(ctx: RequestContext, executionContext: ExecutionContext): Promise<boolean> {
		const { args } = parseContext(executionContext);
		// we have to inspect the input of the current resolver and access the config.gqlMarketplacesArgsPath
		// then use the role service to check permissions
		const marketplaceId = getByPath(args, this.config.gqlMarketplaceIdArgsPath);
		const normalizedMarketplaceId = Array.isArray(marketplaceId) ? marketplaceId[0] : marketplaceId;

		const hasPermission = await this.roleService.userHasPermissionOnMarketplace(
			ctx,
			normalizedMarketplaceId,
			this.config.permission,
		);

		return hasPermission;
	}
}

function getByPath(obj: unknown, path?: string): unknown {
	if (!path) return undefined;

	return path.split('.').reduce((current: any, key) => current?.[key], obj);
}
