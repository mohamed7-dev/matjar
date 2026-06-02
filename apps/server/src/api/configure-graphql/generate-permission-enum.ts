import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import { GraphQLEnumType, GraphQLEnumValueConfigMap, GraphQLSchema } from 'graphql';
import {
	getNormalizedCompanyAppPermissions,
	getNormalizedPlatformAppPermissions,
} from '../common/default-permissions';

const PERMISSION_ENUM_DESCRIPTION = `
Defines the set of access rules recognized by the system.

These values are typically used by runtime guards or interceptors
to determine whether an operation may be executed.

Certain access keys may require additional contextual checks
beyond static evaluation.`;

export function generatePermissionEnum(baseSchema: GraphQLSchema): GraphQLSchema {
	const platformPermissions = getNormalizedPlatformAppPermissions();
	const companyPermissions = getNormalizedCompanyAppPermissions();
	const permissions = [
		...platformPermissions,
		...companyPermissions,
	];

	const values: GraphQLEnumValueConfigMap = {};
	let index = 0;

	for (const permission of permissions) {
		values[permission.key] = {
			value: index,
			description: permission.description,
		};
		index++;
	}

	const permissionEnum = new GraphQLEnumType({
		name: 'Permission',
		description: PERMISSION_ENUM_DESCRIPTION,
		values,
	});

	return stitchSchemas({
		subschemas: [
			baseSchema,
		],
		types: [
			permissionEnum,
		],
		typeMergingOptions: {
			validationSettings: {
				validationLevel: ValidationLevel.Off,
			},
		},
	});
}
