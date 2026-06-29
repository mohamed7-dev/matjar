import { Table, TableBody } from '@matjar/design-system/components/table';
import type { AssetViewProps } from '../asset-view-props.js';
import { AssetEmpty } from '../assets-empty.js';
import { AssetsLoader } from '../assets-loader.js';
import { AssetBodyRow } from './asset-body-row.js';
import { AssetTableHeader } from './asset-table-header.js';

export function AssetListView({
	assets,
	isLoading,
	isAssetSelected,
	toggleSelection,
	onAssetClick,
}: AssetViewProps) {
	if (isLoading) {
		return <AssetsLoader />;
	}

	if (!assets.length) {
		return <AssetEmpty />;
	}

	return (
		<Table>
			<AssetTableHeader />
			<TableBody>
				{assets.map((asset) => (
					<AssetBodyRow
						key={asset.id}
						asset={asset}
						selected={isAssetSelected(asset)}
						onClick={onAssetClick}
						onToggleSelection={toggleSelection}
					/>
				))}
			</TableBody>
		</Table>
	);
}
