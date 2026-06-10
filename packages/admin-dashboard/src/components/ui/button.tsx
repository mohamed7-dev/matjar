import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/cn.js';

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 rounded-none text-sm font-medium whitespace-nowrap transition-all outline-none border-4 border-black shadow-sm active:shadow-2xs active:translate-y-1 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/75',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/75 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:hover:bg-destructive/70 dark:active:bg-destructive/50 dark:focus-visible:ring-destructive/40',
				outline:
					'border-4 border-foreground bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:border-white dark:bg-input/30 dark:hover:bg-input/50 dark:active:bg-input/40',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60',
				ghost: 'border-4 border-transparent hover:border-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/60 dark:hover:border-white dark:hover:bg-accent/50 dark:active:bg-accent/40',
				link: 'text-primary underline-offset-4 hover:underline active:text-primary/75',
			},
			size: {
				default: 'h-11 px-6 py-2.5 has-[>svg]:px-5',
				xs: "h-8 gap-1 px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-10 gap-1.5 px-4 has-[>svg]:px-3',
				lg: 'h-12 px-8 has-[>svg]:px-6',
				icon: 'size-11',
				'icon-xs': "size-8 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-10',
				'icon-lg': 'size-12',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot='button'
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
