import { borderRadii } from "./border-radii.js";
import { chart, neutral, primary } from "./colors.js";
import { shadows } from "./shadows.js";
import { fontFamily, fontWeight } from "./typography.js";

export const lightTheme = {
	colors: {
		// COLORS -> SURFACES
		background: primary[200],
		foreground: neutral[950],
		"secondary-background": neutral[50],
		overlay: neutral[950],

		// COLORS -> SEMANTIC COLORS
		primary: primary[500],
		"primary-foreground": neutral[950],

		border: neutral[950],
		ring: neutral[950],

		// COLORS -> CHARTS
		"chart-1": chart[1],
		"chart-2": chart[2],
		"chart-3": chart[3],
		"chart-4": chart[4],
		"chart-5": chart[5],
		"chart-active-dot": neutral[950],
	},

	spacing: {
		"box-shadow-x": "4px",
		"box-shadow-y": "4px",
		"reverse-box-shadow-y": "-4px",
		"reverse-box-shadow-x": "-4px",
		"card-spacing": "1.5rem",
	},

	fontFamily: {
		sans: fontFamily.sans,
		heading: fontFamily.heading,
		body: fontFamily.body,
		mono: fontFamily.mono,
	},

	fontWeight: {
		heading: fontWeight.bold,
		base: fontWeight.medium,
	},

	radius: {
		base: borderRadii.sm,
		none: borderRadii.none,
	},

	shadow: {
		default: shadows.default,
		reverse: shadows.reverse,
	},
} as const;
