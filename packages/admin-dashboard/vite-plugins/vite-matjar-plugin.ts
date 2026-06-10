import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import { viteAppConfigLoaderPlugin } from './vite-app-config-loader-plugin.js';
import { viteBasePathHtmlPlugin } from './vite-base-path-html-plugin.js';
import { viteConfigPlugin } from './vite-config-plugin.js';
import { viteGqlTadaPlugin } from './vite-gql-tada-plugin.js';
import { viteThemePlugin } from './vite-theme-plugin.js';
import { type UiConfigPluginOptions, viteUiConfigPlugin } from './vite-ui-config-plugin.js';

function getDashboardRoot(): string {
	const fileUrl = import.meta.resolve('@matjar/admin-dashboard');
	const packagePath = fileUrl.startsWith('file:') ? new URL(fileUrl).pathname : fileUrl;
	return path.join(packagePath, '../../..');
}

export function getNormalizedAppConfigPath(appConfigPath: string | URL): string {
	const stringPath = typeof appConfigPath === 'string' ? appConfigPath : appConfigPath.href;
	if (stringPath.startsWith('file:')) {
		return new URL(stringPath).pathname;
	}
	return stringPath;
}

interface ViteMatjarPLuginOptions {
	appConfigPath: string | URL;
	gqlTadaOutputPath?: string;
	ui?: UiConfigPluginOptions;
}

export function viteMatjarPLugin(options: ViteMatjarPLuginOptions): PluginOption[] {
	const tempDirPath = path.join(import.meta.dirname, '..', '.temp');
	const packageRoot = getDashboardRoot();
	const normalizedConfigPath = getNormalizedAppConfigPath(options.appConfigPath);
	return [
		devtools(),
		tanstackRouter({
			autoCodeSplitting: true,
			routeFileIgnorePattern: '.graphql.ts|components|hooks|utils',
			routesDirectory: path.join(packageRoot, './src/app/routes'),
			generatedRouteTree: path.join(packageRoot, './src/app/routeTree.gen.ts'),
		}),
		viteReact(),
		viteThemePlugin(),
		tailwindcss(),
		viteAppConfigLoaderPlugin({
			appConfigPath: normalizedConfigPath,
		}),
		viteConfigPlugin({
			packageRoot,
		}),
		viteUiConfigPlugin(options.ui),
		!!options.gqlTadaOutputPath &&
			viteGqlTadaPlugin({
				packageRoot,
				tempDir: tempDirPath,
				gqlTadaOutputPath: options.gqlTadaOutputPath,
			}),
		viteBasePathHtmlPlugin(),
	];
}
