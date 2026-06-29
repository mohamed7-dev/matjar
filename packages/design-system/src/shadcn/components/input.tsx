import { cn } from "@matjar/design-system/lib/utils";
import type * as React from "react";

// Neo-Brutalism

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"h-10 w-full min-w-0 border-2 border-border rounded-base bg-secondary-background px-3 py-2 text-sm font-base transition-[color,border-color] outline-none 	file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-heading placeholder:text-foreground/50	selection:bg-primary selection:text-primary-foreground 	disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
