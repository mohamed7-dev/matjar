import { chart, neutral, primary } from "./colors.js";
import { fontFamily } from "./typography.js";

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
	},

	font: {
		"font-sans": fontFamily.sans,
		"font-heading": fontFamily.heading,
		"font-body": fontFamily.body,
		"font-mono": fontFamily.mono,
	},
} as const;

// export const darkTheme = {
// 	// SURFACES
// 	background: neutral[950],
// 	foreground: neutral[50],

// 	card: neutral[800],
// 	"card-foreground": neutral[50],

// 	popover: neutral[800],
// 	"popover-foreground": neutral[50],

// 	// COLORS
// 	primary: primary[500],
// 	"primary-foreground": neutral[950],

// 	secondary: secondary[400],
// 	"secondary-foreground": neutral[950],

// 	muted: neutral[800],
// 	"muted-foreground": neutral[200],

// 	accent: accent[500],
// 	"accent-foreground": neutral[950],

// 	border: neutral[50],
// 	input: neutral[50],
// 	ring: primary[500],

// 	// STATUS
// 	destructive: neutral[50],
// 	"destructive-foreground": neutral[950],

// 	// CHARTS
// 	"chart-1": chart[1],
// 	"chart-2": chart[2],
// 	"chart-3": chart[3],
// 	"chart-4": chart[4],
// 	"chart-5": chart[5],

// 	// SIDEBAR
// 	sidebar: neutral[950],
// 	"sidebar-foreground": neutral[50],

// 	"sidebar-primary": primary[500],
// 	"sidebar-primary-foreground": neutral[950],

// 	"sidebar-accent": accent[500],
// 	"sidebar-accent-foreground": neutral[950],

// 	"sidebar-border": neutral[50],
// 	"sidebar-ring": primary[500],

// 	// RADII
// 	radius: borderRadii.md,

// 	// SHADOWS
// 	"shadow-2xs": shadows["2xs"],
// 	"shadow-xs": shadows.xs,
// 	"shadow-sm": shadows.sm,
// 	"shadow-md": shadows.md,
// 	"shadow-lg": shadows.lg,
// 	"shadow-xl": shadows.xl,
// 	"shadow-2xl": shadows["2xl"],
// } as const;
