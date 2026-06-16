import path from 'node:path';
import { viteMatjarPlugin } from '@matjar/admin-dashboard';
import { defineConfig } from 'vite';

export default defineConfig({
	base: '/dashboard/',
	plugins: [
		viteMatjarPlugin({
			appConfigPath: path.join(__dirname, './src/app-config.ts'),
			ui: {
				api: {
					host: 'http://localhost',
					port: 3000,
				},
			},
			gqlTadaOutputPath: path.resolve(__dirname, './src/graphql/'),
		}),
	],
	build: {
		outDir: path.resolve(__dirname, 'public/dashboard'),
		emptyOutDir: true,
	},
});
