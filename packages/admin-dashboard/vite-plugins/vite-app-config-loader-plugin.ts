import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RuntimeAppConfig } from '@matjar/server';
import ts from 'typescript';
import { normalizePath, type Plugin, type PluginOption } from 'vite';

const VIRTUAL_ID = 'virtual:app-config';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
export const configLoaderPluginName = 'matjar:app-config-loader';
const compiledConfigCache = new Map<string, Promise<RuntimeAppConfig>>();

export interface ConfigLoaderApi {
	getAppConfig(): Promise<RuntimeAppConfig>;
}

interface ViteAppConfigLoaderPluginOptions {
	appConfigPath: string;
}

/**
 * @description
 * Vite plugin that loads and compiles the application configuration at build time.
 *
 * It resolves a user-defined config file, transpiles it in isolation, and imports
 * the resulting module to produce a strongly-typed `RuntimeAppConfig`.
 *
 * :::info
 * The plugin exposes a Rollup-compatible API (via plugin `api`) that allows other
 * plugins to safely retrieve the compiled config during the Vite build lifecycle.
 * :::
 */
export function viteAppConfigLoaderPlugin(options: ViteAppConfigLoaderPluginOptions): PluginOption {
	const appConfigPath = normalizePath(options.appConfigPath);
	return {
		name: configLoaderPluginName,
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},
		async load(id) {
			if (id !== RESOLVED_ID) return;
			return [
				`import { appConfig as loadedAppConfig } from ${JSON.stringify(options.appConfigPath)};`,
				'export const appConfig = loadedAppConfig;',
			].join('\n');
		},
		api: {
			async getAppConfig(): Promise<RuntimeAppConfig> {
				return compileAndLoadAppConfig(appConfigPath);
			},
		} satisfies ConfigLoaderApi,
	};
}

async function compileAndLoadAppConfig(appConfigPath: string): Promise<RuntimeAppConfig> {
	const sourceFilePath = await resolveAppConfigSource(appConfigPath);
	if (!sourceFilePath) {
		throw new Error(`Could not resolve app config path: ${appConfigPath}`);
	}

	const cacheKey = sourceFilePath;
	if (!compiledConfigCache.has(cacheKey)) {
		compiledConfigCache.set(cacheKey, compileAndImportAppConfig(sourceFilePath));
	}
	return compiledConfigCache.get(cacheKey) as Promise<RuntimeAppConfig>;
}

async function resolveAppConfigSource(appConfigPath: string): Promise<string | null> {
	if (path.extname(appConfigPath) === '') {
		const candidates = [
			`${appConfigPath}.ts`,
			`${appConfigPath}.tsx`,
			`${appConfigPath}.js`,
			`${appConfigPath}.mjs`,
		];
		for (const candidate of candidates) {
			if (await fileExists(candidate)) return candidate;
		}
	}
	return (await fileExists(appConfigPath)) ? appConfigPath : null;
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function compileAndImportAppConfig(sourceFilePath: string): Promise<RuntimeAppConfig> {
	const outputPath = await buildTempEnv(sourceFilePath);
	const sourceFiles = await collectLocalSourceFiles(sourceFilePath);
	const sourceRoot = path.dirname(sourceFilePath);
	for (const filePath of sourceFiles) {
		const source = await fs.readFile(filePath, 'utf-8');
		const transpiled = ts.transpileModule(source, {
			compilerOptions: {
				target: ts.ScriptTarget.ES2020,
				module: ts.ModuleKind.ESNext,
				moduleResolution: ts.ModuleResolutionKind.NodeNext,
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				jsx: ts.JsxEmit.Preserve,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				resolveJsonModule: true,
			},
			fileName: filePath,
		});
		const relativePath = path.relative(sourceRoot, filePath);
		const outputFilePath = path.join(outputPath, relativePath).replace(/\.tsx?$/, '.js');
		const compiledSource = rewriteTypeScriptImportExtensions(transpiled.outputText);
		await fs.mkdir(path.dirname(outputFilePath), {
			recursive: true,
		});
		await fs.writeFile(outputFilePath, compiledSource, 'utf-8');
	}
	const compiledEntry = path.join(outputPath, path.basename(sourceFilePath).replace(/\.tsx?$/, '.js'));
	const imported = await import(pathToFileURL(compiledEntry).href);
	if (!('appConfig' in imported)) {
		throw new Error(`Compiled app config did not export 'appConfig' from ${sourceFilePath}`);
	}
	return imported.appConfig as RuntimeAppConfig;
}

async function buildTempEnv(sourceFilePath: string) {
	// nodejs won't understand .ts files so we have to create a temp env that contains the compiled js files

	const outputPath = path.join(
		os.tmpdir(),
		'matjar-dashboard-app-config',
		path.basename(sourceFilePath, path.extname(sourceFilePath)),
	);
	await fs.rm(outputPath, {
		recursive: true,
		force: true,
	});
	await fs.mkdir(outputPath, {
		recursive: true,
	});

	// nodejs will need type:module to be able to resolve imported/exported modules correctly
	await fs.writeFile(
		path.join(outputPath, 'package.json'),
		JSON.stringify(
			{
				type: 'module',
				private: true,
			},
			null,
			2,
		),
	);

	return outputPath;
}

async function collectLocalSourceFiles(entryFile: string): Promise<Array<string>> {
	// build the dependency graph of the entryFile(app config file)
	const visited = new Set<string>();
	async function walk(filePath: string) {
		const resolved = await resolveModuleFile(filePath);
		if (!resolved || visited.has(resolved)) return;
		visited.add(resolved);
		const source = await fs.readFile(resolved, 'utf-8');
		// creates AST for the resolved module
		const sf = ts.createSourceFile(resolved, source, ts.ScriptTarget.Latest, true);
		const dir = path.dirname(resolved);
		ts.forEachChild(sf, (node) => {
			if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) return;
			const moduleSpecifier = node.moduleSpecifier;
			if (!moduleSpecifier || !ts.isStringLiteral(moduleSpecifier)) return;

			const importPath = moduleSpecifier.text;
			if (importPath.startsWith('.') || importPath.startsWith('/')) {
				walk(path.resolve(dir, importPath)).catch(() => undefined);
			}
		});
	}
	await walk(entryFile);
	return Array.from(visited);
}

async function resolveModuleFile(importPath: string): Promise<string | null> {
	const candidateFiles = [
		importPath,
		`${importPath}.ts`,
		`${importPath}.tsx`,
		`${importPath}.js`,
		`${importPath}.mjs`,
	];
	for (const candidate of candidateFiles) {
		if (await fileExists(candidate)) return candidate;
	}
	return null;
}

function rewriteTypeScriptImportExtensions(source: string): string {
	return source
		.replace(/(from\s+['"])(.*?)(\.ts|\.tsx)(['"])/g, '$1$2.js$4')
		.replace(/(import\(\s*['"])(.*?)(\.ts|\.tsx)(['"]\s*\))/g, '$1$2.js$4');
}

/**
 * @description
 * Resolves a shared API exposed by another Vite plugin using Rollup’s
 * inter-plugin communication pattern.
 *
 * :::info
 * This follows the Rollup plugin design principle of direct plugin communication:
 * https://rollupjs.org/plugin-development/#direct-plugin-communication
 * :::
 */
export function getConfigLoaderApi(plugins: readonly Plugin[]): ConfigLoaderApi {
	const parent = plugins.find((p) => p.name === configLoaderPluginName);

	if (!parent) {
		throw new Error(`Missing required plugin "${configLoaderPluginName}".`);
	}

	return parent.api as ConfigLoaderApi;
}
