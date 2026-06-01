import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule } from '@nestjs/common';
import { GraphQLModule, GraphQLTypesLoader } from '@nestjs/graphql';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { ApiType } from '../utils/get-api-type';
import { buildFinalGraphqlSchema } from './build-final-graphql-schema';

interface ApiOptions {
	apiType: ApiType;
	apiTypesPaths: string[];
	apiPath: string;
	resolverModules: Array<any>;
	enablePlayground: boolean;
	enableDebugging: boolean;
}

async function buildGraphqlModuleOptionsForApi(
	configService: ConfigService,
	typesLoader: GraphQLTypesLoader,
	apiOptions: ApiOptions,
): Promise<ApolloDriverConfig> {
	const schema = await buildFinalGraphqlSchema({
		apiType: apiOptions.apiType,
		typesPaths: apiOptions.apiTypesPaths,
		typesLoader: typesLoader,
		outputAs: 'sdl',
	});
	return {
		path: `/${apiOptions.apiPath}`,
		typeDefs: schema,
		debug: apiOptions.enableDebugging,
		playground: apiOptions.enablePlayground,
		include: [
			...apiOptions.resolverModules,
		],
	};
}

export function initGraphqlModule(
	getApiOptions: (configService: ConfigService) => ApiOptions,
): DynamicModule {
	return GraphQLModule.forRootAsync({
		driver: ApolloDriver,
		useFactory: async (configService: ConfigService, typesLoader: GraphQLTypesLoader) => {
			return await buildGraphqlModuleOptionsForApi(
				configService,
				typesLoader,
				getApiOptions(configService),
			);
		},
		inject: [
			ConfigService,
			GraphQLTypesLoader,
		],
		imports: [
			ConfigModule,
		],
	});
}
