import { Trans } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@matjar/design-system/components/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import type { Asset } from '../asset-gallery/asset-gallery.js';

export type AssetBulkActionContext = {
	selection: Asset[];
	refetch: () => void;
};

export type AssetBulkActionComponent = React.FunctionComponent<AssetBulkActionContext>;

export type AssetBulkAction = {
	order?: number;
	component: AssetBulkActionComponent;
};

interface AssetBulkActionsProps {
	selection: Asset[];
	bulkActions?: AssetBulkAction[];
	refetch: () => void;
}

export function AssetBulkActions({ selection, bulkActions, refetch }: AssetBulkActionsProps) {
	const allBulkActions = [
		...(bulkActions ?? []),
	];
	allBulkActions.sort((a, b) => (a.order ?? 10_000) - (b.order ?? 10_000));
	return (
		<div className='flex items-center gap-4 px-8 py-2 bg-secondary-background rounded-base border-2 border-border animate-in fade-in'>
			<span className='text-sm text-muted-foreground'>
				<Trans>{selection.length} selected</Trans>
			</span>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='noShadow'
						size='sm'
						className='h-8 shadow-none'
					>
						<Trans>With selected...</Trans>
						<ChevronDownIcon className='ml-2 h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start'>
					{allBulkActions.length > 0 ? (
						allBulkActions.map((action, index) => (
							<action.component
								key={`asset-bulk-action-${
									// biome-ignore lint/suspicious/noArrayIndexKey: no other key available
									index
								}`}
								selection={selection}
								refetch={refetch}
							/>
						))
					) : (
						<DropdownMenuItem
							className='text-muted-foreground'
							disabled
						>
							<Trans>No actions available</Trans>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
