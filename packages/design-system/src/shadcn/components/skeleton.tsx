import { cn } from "@matjar/design-system/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("animate-pulse secondary-background rounded-sm border-2 border-border", className)}
			{...props}
		/>
	);
}

export { Skeleton };
