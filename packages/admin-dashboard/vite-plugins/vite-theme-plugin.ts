import { borderRadii, fontWeight, lightTheme as lightTokens, shadows } from '@matjar/design-system';
import type { PluginOption } from 'vite';

type TokenMap = Record<string, string | undefined>;

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
		cssVars(':root', {
			...lightTokens.colors,
			...lightTokens.font,
			...lightTokens.spacing,
		}),
		// cssVars('.dark', baseDark),
	].join('\n\n');
}

function createInlineTheme() {
	const { colors, spacing, font } = lightTokens;
	const colorVars = Object.entries(colors).map(([k]) => `--color-${k}: var(--${k});`);
	const fontVars = Object.entries(font).map(([k]) => `--font-${k}: var(--${k});`);
	const spacingVars = Object.entries(spacing).map(([k]) => `--spacing-${k}: var(--${k});`);
	const fontWeightVars = Object.entries(fontWeight).map(([k, v]) => `--font-weight-${k}: ${v};`);
	const radiusVars = Object.entries(borderRadii).map(([k, v]) => `--radius-${k}: ${v};`);
	const shadowVars = Object.entries(shadows).map(([k, v]) => `--shadow-${k}: ${v};`);

	const dashboardExtensions = [
		'   --shadow-nav: 4px 4px 0px 0px var(--border);',
	];

	const lines = [
		...colorVars,
		...shadowVars,
		...fontVars,
		...fontWeightVars,
		...spacingVars,
		...radiusVars,
		...dashboardExtensions,
	]
		.map((l) => `    ${l}`)
		.join('\n');

	return `@theme inline {\n${lines}\n}`;
}
