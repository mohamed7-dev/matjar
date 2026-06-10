import path from 'node:path';
import type { PluginOption } from 'vite';

interface ViteConfigPluginOptions {
	packageRoot: string;
}

export function viteConfigPlugin(options: ViteConfigPluginOptions): PluginOption {
	return {
		name: 'matjar:vite-config',
		config(config, env) {
			const resolvedRoot = options.packageRoot;

			// 1. always point to the the embedded package source so the app can
			//behave as a self-contained module when imported elsewhere.

			config.root = resolvedRoot;

			// 2. Ensure predictable public assets regardless of embedding.
			config.publicDir = config.publicDir ?? path.join(resolvedRoot, 'public');

			// 3. prevent output from being written into node_modules or the embedded package directory
			if (env.command === 'build') {
				const buildConfig = config.build ?? {};
				const outDir = buildConfig.outDir;

				const hasOutDir = typeof outDir === 'string' && outDir.length > 0;
				const isAbsolute = hasOutDir && path.isAbsolute(outDir);

				const safeOutDir = hasOutDir
					? isAbsolute
						? outDir
						: path.resolve(process.cwd(), outDir)
					: path.resolve(process.cwd(), 'dist');

				config.build = {
					...buildConfig,
					outDir: safeOutDir,
				};
			}

			// 4. module aliases Allow the app to be consumed from node_modules or monorepos
			// without breaking internal imports

			config.resolve = {
				alias: {
					...(config.resolve?.alias ?? {}),
					'@': path.resolve(resolvedRoot, './src'),
					// '@/graphql': path.resolve(resolvedRoot, './src/public-lib/infra/graphql'),
				},
			};

			// 5. prevent vite from pre-bundling the admin-dashboard package source code when
			// this package is consumed from another vite app (server app in this case)
			config.optimizeDeps = {
				...config.optimizeDeps,
				exclude: [
					...(config.optimizeDeps?.exclude ?? []),

					// prevent embedded app pre-bundling
					'@matjar/dashboard',

					// virtual modules must remain external
					'virtual:admin-dashboard-ui-config',
				],
				include: [
					...(config.optimizeDeps?.include ?? []),
					'@matjar/common/lib/generated-types',
					// '@matjar/common/lib/shared-types',
					'@matjar/common/lib/shared-utils',
				],
			};
		},
	};
}
