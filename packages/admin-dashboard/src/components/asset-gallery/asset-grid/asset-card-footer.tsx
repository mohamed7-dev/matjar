import { formatBytes } from '@/lib/format-bytes.js';
import type { Asset } from '../asset-gallery.js';
import { AssetNavigateAction } from '../asset-navigate-action.js';

export function AssetCardFooter({ asset }: { asset: Asset }) {
	return (
		<footer className='flex flex-col gap-2 p-2'>
			<p
				className='line-clamp-1 text-sm'
				title={asset.name}
			>
				{asset.name}
			</p>

			<div className='flex items-center justify-between'>
				<span className='text-xs'>{asset.fileSize ? formatBytes(asset.fileSize) : null}</span>

				<AssetNavigateAction
					id={asset.id}
					className='opacity-0 transition-opacity group-hover:opacity-100'
				/>
			</div>
		</footer>
	);
}
