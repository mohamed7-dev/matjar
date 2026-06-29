import type { AssetViewProps } from '../asset-view-props.js';
import { AssetEmpty } from '../assets-empty.js';
import { AssetsLoader } from '../assets-loader.js';
import { AssetCard } from './asset-card.js';

export function AssetGridView(props: AssetViewProps) {
	if (props.isLoading) {
		return <AssetsLoader />;
	}

	if (props.assets.length === 0) {
		return <AssetEmpty />;
	}

	return (
		<div className='grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-1'>
			{props.assets.map((asset) => (
				<AssetCard
					key={asset.id}
					asset={asset}
					selected={props.isAssetSelected(asset)}
					onSelect={props.onAssetClick}
					onToggleSelection={props.toggleSelection}
				/>
			))}
		</div>
	);
}
