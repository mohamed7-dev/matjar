import { cn } from '@matjar/design-system/lib/utils';
import { ShoppingBagIcon } from 'lucide-react';

interface LogoProps {
	hideText?: boolean;
	size?: 'sm' | 'default' | 'lg';
}

export function Logo({ hideText, size = 'default' }: LogoProps) {
	return (
		<div className='flex items-center gap-3'>
			<div
				className={cn(
					'flex items-center justify-center bg-primary border-2 border-border duration-200 transition-[width,height] ease-linear',
					size === 'sm' && 'size-8',
					size === 'default' && 'size-10',
					size === 'lg' && 'size-12',
				)}
			>
				<ShoppingBagIcon className='text-primary-foreground size-6' />
			</div>
			<span
				className={cn(
					'text-lg font-base duration-200 transition-[width] ease-linear',
					hideText && 'w-0 overflow-hidden',
				)}
			>
				Matjar Commerce
			</span>
		</div>
	);
}
