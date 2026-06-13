import { ShoppingBagIcon } from 'lucide-react';

export function Logo() {
	// TODO: add sizes and orientation props
	return (
		<div className='flex items-center gap-3'>
			<div className='size-10 flex items-center justify-center bg-primary border-2 border-border'>
				<ShoppingBagIcon className='text-primary-foreground size-6' />
			</div>
			<span className='text-lg font-bold'>Matjar Commerce</span>
		</div>
	);
}
