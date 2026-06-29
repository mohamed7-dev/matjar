import { Image } from '@/components/image/image.js';
import type { Asset } from '../asset-gallery.js';
import { AssetSelection } from '../asset-selection.js';

export function AssetThumbnail({
	asset,
	selected,
	onToggle,
}: {
	asset: Asset;
	selected: boolean;
	onToggle(): void;
}) {
	return (
		<div className='relative aspect-square overflow-hidden bg-background'>
			<Image
				asset={{
					...asset,
					url: asset.previewIdentifier,
				}}
				transform={{
					preset: 'thumb',
				}}
				className='size-full object-cover'
			/>

			<div className='absolute left-2 top-2'>
				<AssetSelection
					checked={selected}
					onChange={() => {
						onToggle();
					}}
				/>
			</div>
		</div>
	);
}
