import { Button } from '@matjar/design-system/components/button';
import { cn } from '@matjar/design-system/lib/utils';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';

export function AssetNavigateAction({ id, className }: { id: string; className?: string }) {
	return (
		<Button
			variant='noShadow'
			size='icon-sm'
			className={cn(className)}
			asChild
		>
			<Link
				to={`/assets/${id}`}
				onClick={(e) => e.stopPropagation()}
			>
				<ChevronRightIcon />
			</Link>
		</Button>
	);
}
