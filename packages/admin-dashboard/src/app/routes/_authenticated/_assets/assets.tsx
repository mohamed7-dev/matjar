import { Trans } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { DropdownMenuItem } from '@matjar/design-system/components/dropdown-menu';
import { createFileRoute } from '@tanstack/react-router';
import { Page, PageActionBar, PageActionBarItem, PageTitle } from '@/components/layout-engine/page.js';
import { PageBlock } from '@/components/layout-engine/page-block.js';
import { PageLayout } from '@/components/layout-engine/page-layout.js';

export const Route = createFileRoute('/_authenticated/_assets/assets')({
	component: AssetsPage,
});

function AssetsPage() {
	return (
		<Page pageId='assets-listing-page'>
			<PageTitle>
				<Trans>Assets</Trans>
			</PageTitle>
			<PageActionBar
				menuItems={[
					{
						id: 'delete-asset',
						component: () => <DropdownMenuItem>Delete</DropdownMenuItem>,
					},
				]}
			>
				<PageActionBarItem id='upload-asset'>
					<Button>Upload</Button>
				</PageActionBarItem>
			</PageActionBar>
			<PageLayout>
				<PageBlock
					column='main'
					id='asset-gallery-block'
				>
					<p>Gallery Goes Here</p>
					{/* <AssetGallery
						displayMode={displayMode}
						onDisplayModeChange={handleDisplayModeChange}
						pageSize={pageSize}
						onPageSizeChange={handlePageSizeChange}
					/> */}
				</PageBlock>
			</PageLayout>
		</Page>
	);
}
