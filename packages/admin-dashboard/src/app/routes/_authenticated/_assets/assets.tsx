import { Trans } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import { AssetGallery } from '@/components/asset-gallery/asset-gallery.js';
import { Page, PageActionBar, PageActionBarItem, PageTitle } from '@/components/layout-engine/page.js';
import { PageBlock } from '@/components/layout-engine/page-block.js';
import { PageLayout } from '@/components/layout-engine/page-layout.js';
import { FILE_DIALOG_OPEN_EVENT_TYPE } from '@/lib/keys.js';
import {
	type AssetsDisplayModeUnion,
	type AssetsPageSearchSchema,
	assetsPageSearchSchema,
} from '@/models/assets.schema.js';
import { DeleteAssetsBulkAction } from './components/delete-assets-bulk-action.js';

export const Route = createFileRoute('/_authenticated/_assets/assets')({
	component: AssetsPage,
	validateSearch: (search: Record<string, unknown>) => assetsPageSearchSchema.parse(search),
	loader: () => ({
		breadcrumb: () => <Trans>Assets</Trans>,
	}),
});

function AssetsPage() {
	const navigate = useNavigate({
		from: Route.fullPath,
	});
	const { pageSize, displayMode } = Route.useSearch() as AssetsPageSearchSchema;

	const openFileDialog = () => {
		document.dispatchEvent(new CustomEvent(FILE_DIALOG_OPEN_EVENT_TYPE));
	};

	const onDisplayModeChange = (mode: AssetsDisplayModeUnion) => {
		navigate({
			search: (prev: AssetsPageSearchSchema) => ({
				...prev,
				displayMode: mode,
			}),
		});
	};

	const onPageSizeChange = (pageSize: number) => {
		navigate({
			search: (prev: AssetsPageSearchSchema) => ({
				...prev,
				pageSize,
			}),
		});
	};

	return (
		<Page pageId='assets-listing-page'>
			<PageTitle>
				<Trans>Assets</Trans>
			</PageTitle>
			<PageActionBar>
				<PageActionBarItem
					id='upload-assets-button'
					requiredPermissions={[
						'platform_asset_create',
					]}
				>
					<Button
						onClick={openFileDialog}
						className='whitespace-nowrap'
					>
						<UploadIcon /> <Trans>Upload</Trans>
					</Button>
				</PageActionBarItem>
			</PageActionBar>
			<PageLayout>
				<PageBlock
					column='full'
					id='asset-gallery-block'
				>
					<AssetGallery
						multiSelect='manual'
						displayMode={displayMode}
						onDisplayModeChange={onDisplayModeChange}
						pageSize={pageSize}
						onPageSizeChange={onPageSizeChange}
						bulkActions={[
							{
								component: DeleteAssetsBulkAction,
							},
						]}
					/>
				</PageBlock>
			</PageLayout>
		</Page>
	);
}
