import { cn } from "@matjar/design-system/lib/utils";

// Neo-Brutalism

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("animate-pulse border-2 border-border rounded-base", className)}
			{...props}
		/>
	);
}

export { Skeleton };
