import { GraphQLTypesLoader } from '@nestjs/graphql';
import { buildSchema, GraphQLSchema, printSchema } from 'graphql';
import { RuntimeAppConfig } from '../../config/types/app-config.interface';
import { ApiType } from '../utils/get-api-type';
import { generateAuthInputType } from './generate-auth-input-type';
import { generateListOptions } from './generate-list-options';
import { generatePermissionEnum } from './generate-permission-enum';
import { generateErrorCodeEnum } from './generate-error-code-enum';

interface BuildFinalGraphqlSchemaOptions {
	typesPaths: string[];
	typesLoader: GraphQLTypesLoader;
	apiType: ApiType;
	config: RuntimeAppConfig;
}

export async function buildFinalGraphqlSchema(
	options: BuildFinalGraphqlSchemaOptions & {
		outputAs?: 'graphql-schema';
	},
): Promise<GraphQLSchema>;
export async function buildFinalGraphqlSchema(
	options: BuildFinalGraphqlSchemaOptions & {
		outputAs?: 'sdl';
	},
): Promise<string>;
export async function buildFinalGraphqlSchema(
	options: BuildFinalGraphqlSchemaOptions & {
		outputAs?: 'sdl' | 'graphql-schema';
	},
): Promise<GraphQLSchema | string> {
	const typeDefs = await options.typesLoader.mergeTypesByPaths(options.typesPaths);

	let schema = buildSchema(typeDefs);
	schema = generatePermissionEnum(schema);
	schema = generateAuthInputType(
		schema,
		options.apiType === 'admin'
			? options.config.auth.adminAuthenticationStrategies
			: options.config.auth.storeAuthenticationStrategies,
	);
	schema = generateListOptions(schema);
	schema = generateErrorCodeEnum(schema);

	if (options.outputAs === 'sdl') {
		return printSchema(schema);
	} else {
		return schema;
	}
}
