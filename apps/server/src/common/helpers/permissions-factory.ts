import { Permission } from '@matjar/common/lib/generated-types';

export enum RoleScope {
	PLATFORM = 'PLATFORM',
	COMPANY = 'COMPANY',
}

interface AppPermissionPayload {
	resource: string;
	action?: string;
	scope: RoleScope;
	/**
	 * @description
	 * Human-readable description of what the permission grants.
	 */
	description?: string;
	options?: {
		/**
		 * @description
		 * Whether this is an internal permission not exposed to users.
		 */
		internal?: boolean;
		/**
		 * @description
		 * Whether this permission can be assigned to roles.
		 */
		assignable?: boolean;
	};
}

export type NormalizedPermission = {
	key: Permission;
	scope: RoleScope;
	resource: string;
	action?: string;
	description: string;
	internal: boolean;
	assignable: boolean;
};

/**
 * @description
 * Base class for defining application permissions.
 */
export class AppPermission {
	constructor(protected config: AppPermissionPayload) {}

	protected buildKey(): string {
		const { scope, resource, action } = this.config;

		return action
			? `${scope.toLocaleLowerCase()}_${resource.toLocaleLowerCase()}_${action.toLowerCase()}`
			: `${scope.toLowerCase()}_${resource.toLowerCase()}`;
	}

	public normalizePermission(): NormalizedPermission[] {
		const key = this.buildKey();
		return [
			{
				key: key as Permission,
				scope: this.config.scope,
				resource: this.config.resource,
				action: this.config.action,
				description: this.config.description ?? `Grants permission on ${this.config.resource}`,
				internal: this.config.options?.internal ?? false,
				assignable: this.config.options?.assignable ?? true,
			},
		];
	}

	get permissionKey(): Permission {
		return this.buildKey() as Permission;
	}
}

/**
 * @description
 * Class for defining CRUD (Create, Read, Update, Delete) permissions.
 * Extends AppPermission to generate separate permissions for each operation.
 */
export class CrudPermission extends AppPermission {
	constructor(
		resource: string,
		private scope: RoleScope,
		private descriptionFn?: (operation: 'create' | 'read' | 'update' | 'delete') => string,
	) {
		super({
			resource,
			scope,
		});
	}

	public normalizePermission(): NormalizedPermission[] {
		return [
			'create',
			'read',
			'update',
			'delete',
		].map((operation) => {
			const key = `${this.scope.toLowerCase()}_${this.config.resource.toLocaleLowerCase()}_${operation.toLowerCase()}`;

			return {
				key: key as Permission,
				scope: this.scope,
				resource: this.config.resource,
				action: operation,
				description:
					this.descriptionFn?.(operation as any) ??
					`Grants permission to ${operation} ${this.config.resource}`,
				internal: false,
				assignable: true,
			};
		});
	}

	get Create(): Permission {
		return `${this.scope}_${this.config.resource}_create` as Permission;
	}

	get Read(): Permission {
		return `${this.scope}_${this.config.resource}_read` as Permission;
	}

	get Update(): Permission {
		return `${this.scope}_${this.config.resource}_update` as Permission;
	}

	get Delete(): Permission {
		return `${this.scope}_${this.config.resource}_delete` as Permission;
	}
}

export class ResourcePermission extends AppPermission {
	constructor(
		private resource: string,
		private scope: RoleScope,
		private actions: string[],
		private descriptionFn?: (action: string) => string,
	) {
		super({
			resource,
			scope,
		});
	}

	normalizePermission(): NormalizedPermission[] {
		return this.actions.map((action) => ({
			key: `${this.scope.toLocaleLowerCase()}_${this.resource.toLowerCase()}_${action.toLowerCase()}` as Permission,
			scope: this.scope,
			resource: this.resource,
			action,
			description: this.descriptionFn?.(action) ?? `Allows ${action} on ${this.resource}`,
			assignable: true,
			internal: false,
		}));
	}
}
