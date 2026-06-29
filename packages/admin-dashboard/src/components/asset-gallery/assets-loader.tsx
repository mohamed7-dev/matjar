import { Loader2Icon } from 'lucide-react';

export function AssetsLoader() {
	return (
		<div className='flex items-center justify-center py-12'>
			<Loader2Icon className='size-10 animate-spin' />
			<span className='sr-only'>Loading assets...</span>
		</div>
	);
}
