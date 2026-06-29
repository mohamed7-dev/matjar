import type { Asset } from './asset-gallery.js';

export interface AssetViewProps {
	assets: Asset[];
	isLoading: boolean;
	isAssetSelected: (asset: Asset) => boolean;
	toggleSelection: (asset: Asset) => void;
	onAssetClick: (asset: Asset, event: React.MouseEvent | React.KeyboardEvent) => void;
}
