import { Trans, useLingui } from '@lingui/react/macro';
import { Input } from '@matjar/design-system/components/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@matjar/design-system/components/select';
import { ToggleGroup, ToggleGroupItem } from '@matjar/design-system/components/toggle-group';
import { LayoutGridIcon, LayoutListIcon, SearchIcon } from 'lucide-react';
import type { AssetsDisplayModeUnion } from '@/models/assets.schema.js';

export const AssetType = {
	ALL: 'ALL',
	IMAGE: 'IMAGE',
	VIDEO: 'VIDEO',
	BINARY: 'BINARY',
} as const;

export type AssetTypeUnion = keyof typeof AssetType;

interface ActionsBarProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	assetType: AssetTypeUnion;
	onAssetTypeChange: (type: AssetTypeUnion) => void;
	displayMode: AssetsDisplayModeUnion;
	onDisplayModeChange?: (mode: AssetsDisplayModeUnion) => void;
}

export function ActionsBar({
	searchInput,
	onSearchInputChange,
	assetType,
	onAssetTypeChange,
	displayMode,
	onDisplayModeChange,
}: ActionsBarProps) {
	const { t } = useLingui();

	return (
		<div className='flex flex-col md:flex-row gap-2'>
			<div className='flex-1 flex items-center gap-2 relative'>
				<SearchIcon className='size-4 absolute left-2 top-3' />
				<Input
					placeholder={t`Search assets...`}
					value={searchInput}
					onChange={(e) => onSearchInputChange(e.target.value)}
					className='ps-8'
				/>
			</div>
			<Select
				value={assetType as AssetTypeUnion}
				onValueChange={(value) => value != null && onAssetTypeChange(value as AssetTypeUnion)}
			>
				<SelectTrigger className='w-full md:w-[180px]'>
					<SelectValue placeholder={t`Asset type`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={AssetType.ALL}>
						<Trans>All types</Trans>
					</SelectItem>
					<SelectItem value={AssetType.IMAGE}>
						<Trans>Images</Trans>
					</SelectItem>
					<SelectItem value={AssetType.VIDEO}>
						<Trans>Video</Trans>
					</SelectItem>
					<SelectItem value={AssetType.BINARY}>
						<Trans>Binary</Trans>
					</SelectItem>
				</SelectContent>
			</Select>
			{onDisplayModeChange && (
				<ToggleGroup
					type='single'
					value={displayMode}
					onValueChange={(value) => {
						onDisplayModeChange(value as AssetsDisplayModeUnion);
					}}
					variant='noShadow'
				>
					<ToggleGroupItem
						value='grid'
						aria-label={t`Grid view`}
					>
						<LayoutGridIcon />
					</ToggleGroupItem>
					<ToggleGroupItem
						value='list'
						aria-label={t`List view`}
					>
						<LayoutListIcon />
					</ToggleGroupItem>
				</ToggleGroup>
			)}
		</div>
	);
}
