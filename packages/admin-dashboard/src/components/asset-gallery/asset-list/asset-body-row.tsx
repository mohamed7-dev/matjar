import { Badge } from '@matjar/design-system/components/badge';
import { TableCell, TableRow } from '@matjar/design-system/components/table';
import { Image } from '@/components/image/image.js';
import type { Asset } from '../asset-gallery.js';
import { AssetNavigateAction } from '../asset-navigate-action.js';
import { AssetSelection } from '../asset-selection.js';
import { displayDimensions, displayFileSize } from '../asset-utils.js';

interface AssetBodyRowProps {
	asset: Asset;
	selected: boolean;
	onClick(asset: Asset, event: React.MouseEvent): void;
	onToggleSelection(asset: Asset): void;
}

export function AssetBodyRow({ asset, selected, onClick, onToggleSelection }: AssetBodyRowProps) {
	return (
		<TableRow
			data-state={selected ? 'selected' : undefined}
			onClick={(e) => onClick(asset, e)}
		>
			<TableCell>
				<AssetSelection
					checked={selected}
					onChange={() => {
						onToggleSelection(asset);
					}}
				/>
			</TableCell>
			<TableCell className='p-1.5'>
				<Image
					asset={{
						...asset,
						url: asset.previewIdentifier,
					}}
					transform={{
						preset: 'tiny',
					}}
					className='size-10 rounded-base object-cover'
				/>
			</TableCell>
			<TableCell className='font-medium'>{asset.name}</TableCell>
			<TableCell>
				<Badge
					className='text-xs font-normal'
					variant={'neutral'}
				>
					{asset.type.toLowerCase()}
				</Badge>
			</TableCell>
			<TableCell className='text-muted-foreground'>{displayFileSize(asset)}</TableCell>
			<TableCell className='text-muted-foreground'>{displayDimensions(asset)}</TableCell>
			{/* <TableCell className='text-muted-foreground'>{formatDate(asset.createdAt)}</TableCell> */}
			<TableCell className='text-muted-foreground'>{asset.createdAt}</TableCell>
			<TableCell>
				<AssetNavigateAction id={asset.id} />
			</TableCell>
		</TableRow>
	);
}
