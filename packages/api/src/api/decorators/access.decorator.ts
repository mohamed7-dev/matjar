import { Permission } from '@matjar/common/lib/generated-types';
import { SetMetadata } from '@nestjs/common';
import { AccessPoliciesUnion } from '../access-policies/access-policies-map';

export const ACCESS_DECORATOR_METADATA_KEY = Symbol('ACCESS_DECORATOR_METADATA');

export interface AccessDecoratorMetadataOptions {
	permissions?: Permission[];
	policies?: Array<{
		name: AccessPoliciesUnion;
		options?: object;
	}>;
	requireAllPermissions?: boolean;
}

export function Access(options: AccessDecoratorMetadataOptions): MethodDecorator {
	return SetMetadata(ACCESS_DECORATOR_METADATA_KEY, options);
}
