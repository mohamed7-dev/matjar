import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { AnyRoute } from '@tanstack/react-router';
import type React from 'react';
import { Page, PageActionBar, PageTitle } from '../layout-engine/page.js';
import { FullWidthPageBlock } from '../layout-engine/page-block.js';
import { PageLayout } from '../layout-engine/page-layout.js';

// TODO: change any to a strict type

interface ListPageProps<Q extends TypedDocumentNode<any, any>> {
	pageId: string;
	title: string | React.ReactElement;
	route: AnyRoute | (() => AnyRoute);
	listQueryDocument: Q;
	/**
	 * @description
	 * Providing `deleteMutationDocument` prop creates new delete action in the list item actions dropdown.
	 *
	 * :::info
	 * Not needed if a delete bulk action is already added since it gets rendered into the list item actions dropdown.
	 * :::
	 */
	deleteMutationDocument?: TypedDocumentNode<
		any,
		{
			id: string;
		}
	>;

	children?: React.ReactNode;
}

export function ListPage<Q extends TypedDocumentNode<any, any>>(props: ListPageProps<Q>) {
	const { children, title, pageId, route } = props;
	return (
		<Page pageId={pageId}>
			<PageTitle>{title}</PageTitle>
			<PageActionBar>{children}</PageActionBar>
			<PageLayout>
				<FullWidthPageBlock id='list-data-table'>
					<p>List Data With Pagination Support</p>
				</FullWidthPageBlock>
			</PageLayout>
		</Page>
	);
}
