import { cn } from "@matjar/design-system/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import type * as React from "react";

// Neo-Brutalism

const toggleVariants = cva(
	"group/toggle inline-flex items-center justify-center gap-1.5 rounded-base text-sm font-base tracking-widest whitespace-nowrap uppercase transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-secondary-background aria-pressed:bg-primary text-primary-foreground border-2 border-border shadow-default hover:shadow-none hover:translate-x-box-shadow-x hover:translate-y-box-shadow-y",
				noShadow:
					"bg-secondary-background aria-pressed:bg-primary text-primary-foreground border-2 border-border",
				reverseShadow:
					"bg-secondary-background aria-pressed:bg-primary text-primary-foreground border-2 border-border shadow-reverse hover:shadow-none hover:translate-x-reverse-box-shadow-x hover:translate-y-reverse-box-shadow-y",
			},
			size: {
				default:
					"h-10 min-w-10 px-6 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
				sm: "h-9 min-w-9 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
				lg: "h-11 min-w-11 px-8 has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Toggle({
	className,
	variant = "default",
	size = "default",
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(
				toggleVariants({
					variant,
					size,
					className,
				}),
			)}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
