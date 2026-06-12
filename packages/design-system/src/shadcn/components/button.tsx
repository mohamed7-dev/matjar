import { cn } from "@matjar/design-system/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"text-primary-foreground bg-primary border-2 border-border shadow-default hover:translate-x-box-shadow-x hover:translate-y-box-shadow-y hover:shadow-none",
				noShadow: "text-primary-foreground bg-primary border-2 border-border",
				neutral:
					"bg-secondary-background text-foreground border-2 border-border shadow-default hover:translate-x-box-shadow-x hover:translate-y-box-shadow-y hover:shadow-none",
				reverse:
					"text-primary-foreground bg-primary border-2 border-border hover:translate-x-reverse-box-shadow-x hover:translate-y-reverse-box-shadow-y hover:shadow-default",
			},
			size: {
				default:
					"h-10 gap-1.5 px-6 py-2 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
				xs: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-9 gap-1 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
				lg: "h-11 gap-1.5 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
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
