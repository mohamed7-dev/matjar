import { generate } from "@graphql-codegen/cli";
import { ADMIN_API_PATH, STORE_API_PATH } from "@matjar/common/lib/shared-constants";
import { Logger } from "@matjar/server";
import path from "path";
import { introspectGraphqlApi } from "./introspect-graphql-api";

export const CODEGEN_LOG_CONTEXT = "Codegen";

const ADMIN_SCHEMA_OUTPUT_FILE = path.join(__dirname, "../../schema-admin.json");
const STORE_SCHEMA_OUTPUT_FILE = path.join(__dirname, "../../schema-store.json");

async function main() {
	Promise.all([
		introspectGraphqlApi(ADMIN_API_PATH, ADMIN_SCHEMA_OUTPUT_FILE),
		introspectGraphqlApi(STORE_API_PATH, STORE_SCHEMA_OUTPUT_FILE),
	])
		.then(() => {
			Logger.info("Attempting to generate types from existing schema json files", CODEGEN_LOG_CONTEXT);

			const biomeDisablePlugin = path.join(__dirname, "./biome-disable-plugin");
			const graphQlErrorsPlugin = path.join(__dirname, "./error-plugin");

			const commonPlugins = [
				biomeDisablePlugin,
				"typescript",
			];

			const config = {
				strict: true,
				scalars: {
					Money: "number",
				},
				namingConvention: {
					enumValues: "keep",
				},
			};

			const codegenConfig = {
				generates: {
					[path.join(__dirname, "../../packages/common/src/generated-types.ts")]: {
						schema: [
							ADMIN_SCHEMA_OUTPUT_FILE,
						],
						config: {
							...config,
							scalars: {
								...(config.scalars ?? {}),
								ID: "string",
								maybeValue: "T",
							},
						},
						plugins: commonPlugins,
					},
					[path.join(__dirname, "../../packages/common/src/generated-store-types.ts")]: {
						schema: [
							STORE_SCHEMA_OUTPUT_FILE,
						],
						config: {
							...config,
							scalars: {
								...(config.scalars ?? {}),
								ID: "string",
								maybeValue: "T",
							},
						},
						plugins: commonPlugins,
					},
					[path.join(
						__dirname,
						"../../apps/server/src/common/errors/generated-graphql-admin-errors.ts",
					)]: {
						schema: [
							ADMIN_SCHEMA_OUTPUT_FILE,
						],
						plugins: [
							biomeDisablePlugin,
							graphQlErrorsPlugin,
						],
					},
					[path.join(
						__dirname,
						"../../apps/server/src/common/errors/generated-graphql-store-errors.ts",
					)]: {
						schema: [
							STORE_SCHEMA_OUTPUT_FILE,
						],
						plugins: [
							biomeDisablePlugin,
							graphQlErrorsPlugin,
						],
					},
				},
			};

			return generate(codegenConfig);
		})
		.then(
			() => {
				process.exit(0);
			},
			(err) => {
				console.error(err);
				process.exit(1);
			},
		);
}

void main();
