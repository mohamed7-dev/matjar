"use client";

import { cn } from "@matjar/design-system/lib/utils";
import { Separator as SeparatorPrimitive } from "radix-ui";
import type * as React from "react";

// Neo-Brutalism

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border data-horizontal:h-0.5 data-horizontal:w-full data-vertical:w-0.5 data-vertical:self-stretch",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
