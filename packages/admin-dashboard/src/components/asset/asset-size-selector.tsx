import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@matjar/design-system/components/select';
import type { ImagePreset } from '../image/image.js';
import { PRESET_SIZES } from '../image/utils.js';

export interface AssetSizeSelectorProps {
	size: ImagePreset;
	onSizeChange: (size: ImagePreset) => void;
	width: number;
	height: number;
}

export function AssetSizeSelector({ size, onSizeChange, width, height }: Readonly<AssetSizeSelectorProps>) {
	return (
		<div className='flex items-center gap-2'>
			<Select
				value={size ?? undefined}
				onValueChange={(value) => onSizeChange(value as ImagePreset)}
			>
				<SelectTrigger>
					<SelectValue placeholder='Select size' />
				</SelectTrigger>
				<SelectContent>
					{Object.keys(PRESET_SIZES).map((preset) => (
						<SelectItem
							value={preset}
							key={preset}
							className='uppercase'
						>
							{preset}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className='text-sm text-foreground/70'>
				{width} x {height}
			</p>
		</div>
	);
}
