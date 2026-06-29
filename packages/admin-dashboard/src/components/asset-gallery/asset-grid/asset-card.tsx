import { Separator } from '@matjar/design-system/components/separator';
import { cn } from '@matjar/design-system/lib/utils';
import type { Asset } from '../asset-gallery.js';
import { AssetCardFooter } from './asset-card-footer.js';
import { AssetThumbnail } from './asset-thumbnail.js';

interface AssetCardProps {
	asset: Asset;
	selected: boolean;
	onSelect(asset: Asset, e: React.MouseEvent | React.KeyboardEvent): void;
	onToggleSelection(asset: Asset): void;
}

export function AssetCard({ asset, selected, onSelect, onToggleSelection }: AssetCardProps) {
	const cardClasses = cn(
		'group',
		'rounded-base',
		'border-2 border-border',
		'bg-secondary-background',
		'shadow-default',
		'transition-all duration-200',
		'hover:translate-x-box-shadow-x',
		'hover:translate-y-box-shadow-y',
		'hover:shadow-none',
		'focus:ring-2',
		'focus:ring-ring',
		'focus:ring-offset-2',
	);
	return (
		<button
			type='button'
			onClick={(e) => onSelect(asset, e)}
			className={cardClasses}
		>
			<AssetThumbnail
				asset={asset}
				selected={selected}
				onToggle={() => onToggleSelection(asset)}
			/>
			<Separator />
			<AssetCardFooter asset={asset} />
		</button>
	);
}
