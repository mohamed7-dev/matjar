import { GraphQLTypesLoader } from '@nestjs/graphql';
import { buildSchema, GraphQLSchema, printSchema } from 'graphql';
import { ConfigService } from '../../config/config.service';
import { ApiType } from '../utils/get-api-type';
import { generateAuthInputType } from './generate-auth-input-type';
import { generatePermissionEnum } from './generate-permission-enum';

interface BuildFinalGraphqlSchemaOptions {
	typesPaths: string[];
	typesLoader: GraphQLTypesLoader;
	apiType: ApiType;
	configService: ConfigService;
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
			? options.configService.auth.adminAuthenticationStrategies
			: options.configService.auth.storeAuthenticationStrategies,
	);

	if (options.outputAs === 'sdl') {
		return printSchema(schema);
	} else {
		return schema;
	}
}
