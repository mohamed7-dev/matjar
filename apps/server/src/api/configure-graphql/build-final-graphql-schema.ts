import { GraphQLTypesLoader } from '@nestjs/graphql';
import { buildSchema, GraphQLSchema, printSchema } from 'graphql';
import { ApiType } from '../utils/get-api-type';

interface BuildFinalGraphqlSchemaOptions {
	typesPaths: string[];
	typesLoader: GraphQLTypesLoader;
	apiType: ApiType;
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

	const schema = buildSchema(typeDefs);

	if (options.outputAs === 'sdl') {
		return printSchema(schema);
	} else {
		return schema;
	}
}
