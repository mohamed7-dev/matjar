import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule } from '@nestjs/common';
import { GraphQLModule, GraphQLTypesLoader } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { I18nModule } from '../../i18n/i18n.module';
import { I18nService } from '../../i18n/i18n.service';
import { ApiType } from '../utils/get-api-type';
import { buildFinalGraphqlSchema } from './build-final-graphql-schema';
import { generateResolvers } from './generate-resolvers';
import { TranslateErrorsPLugin } from './translate-errors-plugin';

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
	i18nService: I18nService,
	typesLoader: GraphQLTypesLoader,
	apiOptions: ApiOptions,
): Promise<ApolloDriverConfig> {
	const schema = await buildFinalGraphqlSchema({
		apiType: apiOptions.apiType,
		typesPaths: apiOptions.apiTypesPaths,
		typesLoader: typesLoader,
		outputAs: 'graphql-schema',
		configService,
	});

	const resolvers = generateResolvers(apiOptions.apiType, schema);
	const plugins = [
		new TranslateErrorsPLugin(i18nService),
	];

	return {
		path: `/${apiOptions.apiPath}`,
		typeDefs: printSchema(schema),
		resolvers,
		debug: apiOptions.enableDebugging,
		playground: apiOptions.enablePlayground,
		include: [
			...apiOptions.resolverModules,
		],
		context: (ctx: any) => ({
			req: ctx.req,
			res: ctx.res,
		}),
		plugins,
	};
}

export function initGraphqlModule(
	getApiOptions: (configService: ConfigService) => ApiOptions,
): DynamicModule {
	return GraphQLModule.forRootAsync({
		driver: ApolloDriver,
		useFactory: async (
			configService: ConfigService,
			i18nService: I18nService,
			typesLoader: GraphQLTypesLoader,
		) => {
			return await buildGraphqlModuleOptionsForApi(
				configService,
				i18nService,
				typesLoader,
				getApiOptions(configService),
			);
		},
		inject: [
			ConfigService,
			I18nService,
			GraphQLTypesLoader,
		],
		imports: [
			ConfigModule,
			I18nModule,
		],
	});
}
