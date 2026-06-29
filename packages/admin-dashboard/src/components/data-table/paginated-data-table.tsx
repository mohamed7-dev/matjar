import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import React from 'react';

// TODO: change any to a strict type

interface PaginatedDataTableProps<Q extends TypedDocumentNode<any, any>> {
	listQueryDocument: Q;
}

export function PaginatedDataTable<Q extends TypedDocumentNode<any, any>>(props: PaginatedDataTableProps<Q>) {
	const { listQueryDocument } = props;
	return <div>PaginatedDataTable</div>;
}
