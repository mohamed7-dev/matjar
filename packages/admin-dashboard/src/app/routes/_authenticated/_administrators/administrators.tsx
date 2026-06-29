import { Trans } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { PageActionBarItem } from '@/components/layout-engine/page.js';
import { ListPage } from '@/components/page/list-page.js';
import { administratorsQueryDocument } from '@/services/administrator.document.js';

export const Route = createFileRoute('/_authenticated/_administrators/administrators')({
	component: AdministratorsPage,
});

function AdministratorsPage() {
	return (
		<ListPage
			pageId='administrator-list'
			title={<Trans>Administrators</Trans>}
			route={Route}
			listQueryDocument={administratorsQueryDocument}
		>
			<PageActionBarItem
				id='create-button'
				requiredPermissions={[
					'platform_administrator_create',
				]}
			>
				<Button asChild>
					<Link to={'./new'}>
						<PlusIcon />
						New Administrator
					</Link>
				</Button>
			</PageActionBarItem>
		</ListPage>
	);
}
