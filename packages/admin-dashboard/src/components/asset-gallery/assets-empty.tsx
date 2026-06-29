import { Trans } from '@lingui/react/macro';

export function AssetEmpty() {
	return (
		<div className='flex items-center justify-center py-12 text-foreground font-base'>
			<Trans>No assets found. Try adjusting your filters or search input.</Trans>
		</div>
	);
}
