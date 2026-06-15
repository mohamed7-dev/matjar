import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { viteMatjarPlugin } from '@matjar/admin-dashboard';
import { defineConfig } from 'vitest/config';

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const appConfigPath = pathToFileURL(path.join(serverRoot, 'src/app-config.ts'));
// const gqlTadaOutputPath = path.join(serverRoot, 'graphql');

export default defineConfig({
	base: '/dashboard/',
	plugins: [
		viteMatjarPlugin({
			appConfigPath,
		}),
	],
	build: {
		outDir: path.resolve(serverRoot, 'public/dashboard'),
		emptyOutDir: true,
	},
});
