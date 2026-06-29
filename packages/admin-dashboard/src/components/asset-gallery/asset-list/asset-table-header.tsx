import { Trans } from '@lingui/react/macro';
import { TableHead, TableHeader, TableRow } from '@matjar/design-system/components/table';

export function AssetTableHeader() {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className='w-10' />
				<TableHead className='w-12' />
				<TableHead>
					<Trans>Name</Trans>
				</TableHead>
				<TableHead>
					<Trans>Type</Trans>
				</TableHead>
				<TableHead>
					<Trans>Size</Trans>
				</TableHead>
				<TableHead>
					<Trans>Dimensions</Trans>
				</TableHead>
				<TableHead>
					<Trans>Created</Trans>
				</TableHead>
				<TableHead className='w-10' />
			</TableRow>
		</TableHeader>
	);
}
