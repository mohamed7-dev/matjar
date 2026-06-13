import { createRequire } from 'node:module';
import * as babel from '@babel/core';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);

export function linguiMacroPlugin(): Plugin {
	return {
		name: 'matjar:lingui-macro',
		enforce: 'pre',

		async transform(code, id) {
			const cleanId = id.split('?')[0];

			if (!/\.[tj]sx?$/.test(cleanId)) {
				return null;
			}

			if (!code.includes('@lingui/') || !code.includes('/macro')) {
				return null;
			}

			try {
				const result = await babel.transformAsync(code, {
					filename: id,
					presets: [
						[
							require.resolve('@babel/preset-typescript'),
							{
								isTSX: true,
								allExtensions: true,
							},
						],
					],
					plugins: [
						require.resolve('@lingui/babel-plugin-lingui-macro'),
					],
					sourceMaps: true,
					configFile: false,
					babelrc: false,
				});

				if (!result?.code) {
					return null;
				}

				return {
					code: result.code,
					map: result.map ?? null,
				};
			} catch (error) {
				console.error(`[matjar:lingui-macro] Failed to transform ${id}:`, error);
				return null;
			}
		},
	};
}
