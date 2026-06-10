import {
	darkTheme as darkTokens,
	fontFamily as fonts,
	lightTheme as lightTokens,
	brand as palette,
	borderRadii as radii,
	lightShadows as shadows,
} from '@matjar/design-system';
import type { PluginOption } from 'vite';

type TokenMap = Record<string, string | undefined>;

const baseLight: TokenMap = {
	...lightTokens,
	brand: palette[500],
	'brand-lighter': palette[300],
	'brand-darker': palette[700],
	'font-sans': fonts.sans,
	'font-heading': fonts.heading,
	'font-body': fonts.body,
	'font-mono': fonts.mono,
};

const baseDark: TokenMap = {
	...darkTokens,
	brand: palette[500],
	'brand-lighter': palette[50],
	'brand-darker': palette[700],
	'font-sans': fonts.sans,
	'font-heading': fonts.heading,
	'font-body': fonts.body,
	'font-mono': fonts.mono,
};

export function viteThemePlugin(): PluginOption {
	return {
		name: 'matjar:admin-dashboard-theme',
		enforce: 'pre',
		transform(code, id) {
			if (!id.endsWith('styles.css')) return null;

			let output = code;
			let changed = false;

			const { changed: varsApplied, content: withVars } = replaceImport({
				token: 'virtual:admin-dashboard-theme',
				source: output,
				replacement: buildThemeSheet(),
			});

			output = withVars;
			changed ||= varsApplied;

			const { content: withInline, changed: inlineApplied } = replaceImport({
				token: 'virtual:admin-dashboard-theme-inline',
				source: output,
				replacement: createInlineTheme(),
			});

			output = withInline;
			changed ||= inlineApplied;
			return changed ? output : null;
		},
	};
}

function replaceImport(options: { token: string; replacement: string; source: string }): {
	changed: boolean;
	content: string;
} {
	const pattern = new RegExp(`@import\\s+['"]${options.token}['"];?`);
	if (!pattern.test(options.source))
		return {
			changed: false,
			content: options.source,
		};

	return {
		changed: true,
		content: options.source.replace(pattern, options.replacement),
	};
}

function cssVars(selector: string, vars: TokenMap) {
	const lines = Object.entries(vars)
		.filter(([, v]) => v != null)
		.map(([key, value]) => `--${key}: ${value};`)
		.join('\n');

	return `${selector}{\n${lines}\n}`;
}

function buildThemeSheet() {
	return [
		cssVars(':root', baseLight),
		cssVars('.dark', baseDark),
	].join('\n\n');
}

function createInlineTheme() {
	const colorAliases = Object.keys(lightTokens)
		.filter((k) => k !== 'radius' && !k.includes('shadow'))
		.map((k) => `--color-${k}: var(--${k});`);
	const radiusVars = Object.entries(radii).map(([k, v]) => `--radius-${k}: ${v};`);
	const shadowVars = Object.entries(shadows).map(([k, v]) => `--shadow-${k}: ${v};`);
	const fontVars = Object.keys(fonts).map((k) => `--font-${k}: var(--font-${k});`);
	const dashboardExtras = [
		'--color-brand: var(--brand);',
		'--color-brand-lighter: var(--brand-lighter);',
		'--color-brand-darker: var(--brand-darker);',
	];

	const lines = [
		...colorAliases,
		...radiusVars,
		...shadowVars,
		...fontVars,
		...dashboardExtras,
	]
		.map((l) => `    ${l}`)
		.join('\n');

	return `@theme inline {\n${lines}\n}`;
}
