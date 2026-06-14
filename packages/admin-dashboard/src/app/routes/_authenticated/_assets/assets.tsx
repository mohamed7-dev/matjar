import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { AssetGallery } from '@/components/asset-gallery/asset-gallery.js';
import { Page, PageTitle } from '@/components/layout-engine/page.js';
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
			<PageLayout>
				<PageBlock
					column='main'
					id='asset-gallery-block'
				>
					<AssetGallery />
				</PageBlock>
			</PageLayout>
		</Page>
	);
}
