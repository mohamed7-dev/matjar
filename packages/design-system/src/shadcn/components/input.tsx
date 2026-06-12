import { cn } from "@matjar/design-system/lib/utils";
import type * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-10 w-full rounded-sm border-2 border-border bg-secondary-background selection:bg-primary selection:text-primary-foreground px-3 py-2 text-sm font-medium text-foreground file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
