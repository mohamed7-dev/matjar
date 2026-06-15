import { pathToFileURL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { viteMatjarPlugin } from './vite-plugins/vite-matjar-plugin.js';

export default defineConfig(({ mode }) => {
	process.env = {
		...process.env,
		...loadEnv(mode, process.cwd()),
	};
	const adminApiHost = process.env.VITE_ADMIN_API_HOST ?? 'http://localhost';
	const adminApiPort = process.env.VITE_ADMIN_API_PORT ? +process.env.VITE_ADMIN_API_PORT : 'auto';

	const configPath = process.env.APP_CONFIG_PATH ?? './sample-app-config.ts';
	return {
		plugins: [
			viteMatjarPlugin({
				appConfigPath: pathToFileURL(configPath),
				gqlTadaOutputPath: './src/infra/graphql',
				ui: {
					api: {
						host: adminApiHost,
						port: adminApiPort,
					},
				},
			}),
		],
	};
});
