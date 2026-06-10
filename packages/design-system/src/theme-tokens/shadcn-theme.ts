import { borderRadii } from "./border-radii.js";
import { brand, destructive, neutral, success, viz, warning } from "./colors.js";
import { darkShadows, lightShadows } from "./shadows.js";

export const lightTheme = {
	// SURFACES
	background: neutral[50],
	foreground: neutral[950],

	card: neutral[100],
	"card-foreground": neutral[950],

	popover: "#ffffff",
	"popover-foreground": neutral[950],

	// COLORS
	primary: brand[500],
	"primary-foreground": "#ffffff",

	secondary: success[500],
	"secondary-foreground": "#ffffff",

	muted: neutral[200],
	"muted-foreground": neutral[800],

	accent: brand[200],
	"accent-foreground": brand[900],

	border: "#000000",
	input: neutral[400],
	ring: brand[500],

	// STATUS
	destructive: destructive[600],
	"destructive-foreground": "#ffffff",

	success: success[600],
	"success-foreground": "#ffffff",

	warning: warning[500],
	"warning-foreground": warning[950],

	// CHARTS
	"chart-1": viz[1],
	"chart-2": viz[2],
	"chart-3": viz[3],
	"chart-4": viz[4],
	"chart-5": viz[5],

	// SIDEBAR
	sidebar: neutral[100],
	"sidebar-foreground": neutral[950],

	"sidebar-primary": brand[500],
	"sidebar-primary-foreground": "#ffffff",

	"sidebar-accent": neutral[200],
	"sidebar-accent-foreground": neutral[950],

	"sidebar-border": "#000000",
	"sidebar-ring": brand[500],

	// RADII
	radius: borderRadii.none,

	// SHADOWS
	"shadow-2xs": lightShadows["2xs"],
	"shadow-xs": lightShadows.xs,
	"shadow-sm": lightShadows.sm,
	"shadow-default": lightShadows.default,
	"shadow-md": lightShadows.md,
	"shadow-lg": lightShadows.lg,
	"shadow-xl": lightShadows.xl,
	"shadow-2xl": lightShadows["2xl"],
} as const;

export const darkTheme = {
	// SURFACES
	background: neutral[950],
	foreground: neutral[100],

	card: neutral[900],
	"card-foreground": neutral[100],

	popover: neutral[900],
	"popover-foreground": neutral[100],

	// COLORS
	primary: brand[400],
	"primary-foreground": neutral[950],

	secondary: success[400],
	"secondary-foreground": neutral[950],

	muted: neutral[800],
	"muted-foreground": neutral[300],

	accent: brand[700],
	"accent-foreground": neutral[100],

	border: "rgba(255,255,255,0.15)",
	input: "rgba(255,255,255,0.2)",
	ring: brand[400],

	// STATUS
	destructive: destructive[500],
	"destructive-foreground": "#ffffff",

	success: success[500],
	"success-foreground": "#ffffff",

	warning: warning[400],
	"warning-foreground": warning[950],

	// CHARTS
	"chart-1": viz[1],
	"chart-2": viz[2],
	"chart-3": viz[3],
	"chart-4": viz[4],
	"chart-5": viz[5],

	// SIDEBAR
	sidebar: neutral[900],
	"sidebar-foreground": neutral[100],

	"sidebar-primary": brand[400],
	"sidebar-primary-foreground": neutral[950],

	"sidebar-accent": neutral[800],
	"sidebar-accent-foreground": neutral[100],

	"sidebar-border": "rgba(255,255,255,0.15)",
	"sidebar-ring": brand[400],

	// SHADOWS
	"shadow-2xs": darkShadows["2xs"],
	"shadow-xs": darkShadows.xs,
	"shadow-sm": darkShadows.sm,
	"shadow-default": darkShadows.default,
	"shadow-md": darkShadows.md,
	"shadow-lg": darkShadows.lg,
	"shadow-xl": darkShadows.xl,
	"shadow-2xl": darkShadows["2xl"],
} as const;
