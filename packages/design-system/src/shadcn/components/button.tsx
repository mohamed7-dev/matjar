import { cn } from "@matjar/design-system/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

// Neo-Brutalism

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-base bg-clip-padding text-sm font-base tracking-widest whitespace-nowrap uppercase ring-offset-white transition-all outline-none select-none   focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2    disabled:pointer-events-none disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground border-2 border-border shadow-default hover:shadow-none hover:translate-x-box-shadow-x hover:translate-y-box-shadow-y",
				noShadow: "bg-primary text-primary-foreground border-2 border-border",
				neutral:
					"bg-secondary-background text-foreground border-2 border-border shadow-default hover:shadow-none hover:translate-x-box-shadow-x hover:translate-y-box-shadow-y",
				neutralNoShadow: "bg-secondary-background text-foreground border-2 border-border",
				reverseShadow:
					"bg-primary text-primary-foreground border-2 border-border shadow-default hover:shadow-none hover:translate-x-reverse-box-shadow-x hover:translate-y-reverse-box-shadow-y",
			},
			size: {
				default:
					"h-10 gap-2 px-4 py-2 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
				xs: "h-7 gap-1 px-2 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-9 gap-1 px-3 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
				lg: "h-11 gap-2 px-8 has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
				icon: "size-10",
				"icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9",
				"icon-lg": "size-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				buttonVariants({
					variant,
					size,
					className,
				}),
			)}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
