import type * as React from 'react';

import { cn } from '@/lib/cn.js';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				'h-12 w-full min-w-0 border-4 border-foreground bg-transparent px-6 py-3 text-base transition-shadow outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
				'focus-visible:shadow-md focus-visible:border-ring',
				'aria-invalid:border-destructive aria-invalid:focus-visible:shadow-none',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
