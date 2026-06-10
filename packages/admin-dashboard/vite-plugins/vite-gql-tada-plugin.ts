import fs from 'node:fs/promises';
import path from 'node:path';
import { generateOutput } from '@gql.tada/cli-utils';
import {
	ADMIN_TYPES_PATHS,
	type AppConfig,
	AppConfigUtils,
	buildFinalGraphqlSchema,
	type RuntimeAppConfig,
} from '@matjar/server';
import { GraphQLTypesLoader } from '@nestjs/graphql';
import { buildSchema, type GraphQLSchema, printSchema } from 'graphql';
import type { ConfigPluginContext, PluginOption } from 'vite';
import { type ConfigLoaderApi, getConfigLoaderApi } from './vite-app-config-loader-plugin.js';

interface ViteGqlTadaPluginOptions {
	gqlTadaOutputPath: string;
	packageRoot: string;
	tempDir: string;
}

/**
 * @description
 * Vite plugin that generates GraphQL artifacts for gql.tada based on the backend schema.
 *
 * During the Vite build process, this plugin:
 * - Loads the app configuration via Vite plugin context
 * - Dynamically generates a safe GraphQL schema
 * - Writes a temporary `tsconfig.json` configured for gql.tada
 * - Outputs a `schema.graphql` file derived from the generated schema
 * - Runs gql.tada code generation to produce TypeScript typings
 * - Copies a runtime `graphql.ts` helper into the output directory
 *
 * This ensures that both schema and client-side GraphQL utilities remain in sync
 * with the current backend configuration.
 *
 */
export function viteGqlTadaPlugin(options: ViteGqlTadaPluginOptions): PluginOption {
	let loaderApi: ConfigLoaderApi | undefined;

	async function writeSchemaFile(dir: string, schema: GraphQLSchema) {
		const file = path.join(dir, 'schema.graphql');
		await fs.writeFile(file, printSchema(schema));
		return file;
	}

	async function writeTsConfig(dir: string) {
		const config = {
			compilerOptions: {
				plugins: [
					{
						name: 'gql.tada/ts-plugin',
						schema: './schema.graphql',
					},
				],
			},
		};

		const filePath = path.join(dir, 'tsconfig.json');

		await fs.writeFile(filePath, JSON.stringify(config, null, 2));

		return filePath;
	}

	async function copyRuntime(ctx: ConfigPluginContext) {
		const from = path.join(options.packageRoot, 'src/infra/graphql/gql-tada.config.ts');

		const to = path.join(options.gqlTadaOutputPath, 'gql-tada.config.ts');

		try {
			await fs.copyFile(from, to);
		} catch (err) {
			if (err instanceof Error) {
				ctx.error(err.message);
			} else {
				ctx.error('Failed to copy gql-tada.config.ts file');
			}
		}
	}

	return {
		name: 'matjar:gql-tada',
		configResolved(config) {
			loaderApi = getConfigLoaderApi(config.plugins);
		},
		async buildStart() {
			if (!loaderApi) {
				throw new Error('Config loader not initialized');
			}
			const appConfig = await loaderApi.getAppConfig();
			const schema = await generateSchema({
				appConfig,
			});
			await fs.mkdir(options.tempDir, {
				recursive: true,
			});

			const tsconfigPath = await writeTsConfig(options.tempDir);
			await writeSchemaFile(options.tempDir, schema);

			await generateOutput({
				output: path.join(options.gqlTadaOutputPath, 'graphql-env.d.ts'),
				tsconfig: tsconfigPath,
			});

			await copyRuntime(this);

			this.info(`graphql introspection files output to ${options.gqlTadaOutputPath}`);
		},
	};
}

let cachedSchema: Promise<GraphQLSchema> | null = null;

export function generateSchema({ appConfig }: { appConfig: AppConfig }): Promise<GraphQLSchema> {
	if (cachedSchema) {
		return cachedSchema;
	}

	cachedSchema = (async () => {
		AppConfigUtils.resetConfig();
		try {
			AppConfigUtils.setConfig(appConfig);
			return await createSchema(AppConfigUtils.getConfig());
		} catch (err) {
			// reset cache so next call can retry
			cachedSchema = null;
			throw err;
		}
	})();

	return cachedSchema;
}

async function createSchema(appConfig: RuntimeAppConfig): Promise<GraphQLSchema> {
	const loader = new GraphQLTypesLoader();

	const sdl = await buildFinalGraphqlSchema({
		typesPaths: ADMIN_TYPES_PATHS,
		typesLoader: loader,
		apiType: 'admin',
		outputAs: 'sdl',
		config: appConfig,
	});

	return buildSchema(sdl);
}
