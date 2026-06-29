import { Trans } from '@lingui/react/macro';
import { Alert, AlertDescription, AlertTitle } from '@matjar/design-system/components/alert';
import { AlertCircleIcon } from 'lucide-react';
import { Page, PageTitle } from '../layout-engine/page.js';
import { PageBlock } from '../layout-engine/page-block.js';
import { PageLayout } from '../layout-engine/page-layout.js';

export interface ErrorPageProps {
	message: string;
}

export function ErrorPage({ message }: ErrorPageProps) {
	return (
		<Page pageId='error-page'>
			<PageTitle>
				<Trans>Error</Trans>
			</PageTitle>
			<PageLayout>
				<PageBlock
					column='main'
					id='error-message'
				>
					<Alert variant='destructive'>
						<AlertCircleIcon />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{message}</AlertDescription>
					</Alert>
				</PageBlock>
			</PageLayout>
		</Page>
	);
}
