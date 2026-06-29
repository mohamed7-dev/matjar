import { Label } from '@matjar/design-system/components/label';
import { ExternalLinkIcon } from 'lucide-react';
import { formatBytes } from '@/lib/format-bytes.js';
import type { AssetFragment } from '@/services/asset.document.js';

interface AssetInfoProps {
	asset: AssetFragment;
}

export function AssetInfo({ asset }: AssetInfoProps) {
	return (
		<div className='space-y-4'>
			<div>
				<Label>Source File</Label>
				<a
					href={asset.sourceIdentifier}
					target='_blank'
					rel='noopener noreferrer'
					className='text-sm text-primary hover:underline'
				>
					{asset.sourceIdentifier.split('/').pop()}
					<ExternalLinkIcon className='size-3 inline ms-1' />
				</a>
			</div>

			<div className='space-y-1'>
				<Label>File Size</Label>
				<p className='text-sm text-foreground/70'>{formatBytes(asset.fileSize)}</p>
			</div>

			<div className='space-y-1'>
				<Label>Dimensions</Label>
				<p className='text-sm text-foreground/70'>
					{asset.width} x {asset.height}
				</p>
			</div>
		</div>
	);
}
