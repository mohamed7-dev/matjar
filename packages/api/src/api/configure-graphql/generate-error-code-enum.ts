import {
	buildSchema,
	extendSchema,
	type GraphQLSchema,
	Kind,
	type ObjectTypeDefinitionNode,
	parse,
} from 'graphql';
import { camelToUpperSnakeCase } from '../../common/utils/camel-case-to-upper-snake-case';

export const API_ERROR_INTERFACE = 'ApiError';

/**
 * @description
 * Dynamically generates members of the `ErrorCode` enum based on
 * all types implementing the `ApiError` interface.
 */
export function generateErrorCodeEnum(typeDefsOrSchema: string | GraphQLSchema): GraphQLSchema {
	const schema = normalizeSchema(typeDefsOrSchema);

	const errorTypes = findApiErrorTypes(schema);
	if (errorTypes.length === 0) {
		return schema;
	}

	const enumExtensionSDL = buildErrorCodeEnumSDL(errorTypes);

	return extendSchema(schema, parse(enumExtensionSDL));
}

function normalizeSchema(input: string | GraphQLSchema): GraphQLSchema {
	return typeof input === 'string' ? buildSchema(input) : input;
}

/**
 * Extract object type nodes implementing ApiError
 */
function findApiErrorTypes(schema: GraphQLSchema): ObjectTypeDefinitionNode[] {
	return Object.values(schema.getTypeMap())
		.map((type) => type.astNode)
		.filter(isApiErrorObjectType);
}

/**
 * Type guard: checks if node is an object type implementing ApiError
 */
function isApiErrorObjectType(node: any): node is ObjectTypeDefinitionNode {
	return (
		node?.kind === Kind.OBJECT_TYPE_DEFINITION &&
		node.interfaces?.some((i: any) => i.name.value === API_ERROR_INTERFACE)
	);
}

/**
 * Build SDL string for extending ErrorCode enum
 */
function buildErrorCodeEnumSDL(nodes: ObjectTypeDefinitionNode[]): string {
	const values = nodes.map((node) => camelToUpperSnakeCase(node.name.value)).join('\n');

	return `
        extend enum ErrorCode {
            ${values}
        }
    `;
}