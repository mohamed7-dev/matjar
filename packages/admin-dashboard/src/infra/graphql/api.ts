import { uiConfig } from 'virtual:admin-dashboard-ui-config';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { LANGUAGE_CODE_QUERY_NAME } from '@matjar/common/lib/shared-constants';
import { AwesomeGraphQLClient } from 'awesome-graphql-client';
import { type DocumentNode, print } from 'graphql';
import { getApiBaseUrl } from '@/lib/get-api-base-url.js';
import {
	LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY,
	LOCAL_STORAGE_SESSION_TOKEN_KEY,
	LOCAL_STORAGE_USER_SETTINGS_KEY,
} from '@/lib/keys.js';

const API_URL = `${getApiBaseUrl()}/${uiConfig.api.adminApiPath}`;

const awesomeClient = new AwesomeGraphQLClient({
	endpoint: API_URL,
	fetch: (url: string, options: RequestInit = {}) => {
		const headers = prepareHeaders(options);
		const finalUrl = getFinalUrl(url);

		return fetch(finalUrl ?? url, {
			...options,
			credentials: 'include',
			mode: 'cors',
			headers,
		}).then((res) => {
			const authToken = res.headers.get(uiConfig.api.authTokenHeaderKey);
			if (authToken) {
				localStorage.setItem(LOCAL_STORAGE_SESSION_TOKEN_KEY, authToken);
			}
			return res;
		});
	},
});

function getFinalUrl(base: string) {
	try {
		const userSettings = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
		if (userSettings) {
			const settings = JSON.parse(userSettings);
			const contentLanguage = settings.contentLanguage;
			if (contentLanguage) {
				const urlObj = new URL(base);
				urlObj.searchParams.set(LANGUAGE_CODE_QUERY_NAME, contentLanguage);
				return urlObj.toString();
			}
		}
	} catch (error) {
		console.warn(
			'Error while reading the contentLanguage from the user settings stored in the local storage',
			error,
		);
	}
}

function prepareHeaders(options: RequestInit) {
	const sessionToken = localStorage.getItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
	const marketplaceRegionToken = localStorage.getItem(LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY);

	const headers = new Headers(options.headers);

	if (sessionToken) {
		headers.set('Authorization', `Bearer ${sessionToken}`);
	}

	if (marketplaceRegionToken) {
		headers.set(uiConfig.api.marketplaceRegionIdentifier, marketplaceRegionToken);
	}

	return headers;
}

export type Variables = object;
export type RequestDocument = string | DocumentNode;

function query<TResults, TVariables extends Variables = Variables>(
	document: RequestDocument | TypedDocumentNode<TResults, TVariables>,
	variables?: TVariables,
): Promise<TResults> {
	const documentString = typeof document === 'string' ? document : print(document);
	return awesomeClient.request(documentString, variables).catch((err) => {
		throw err;
	}) as any;
}

function mutate<TResults, TVariables extends Variables = Variables>(
	document: TypedDocumentNode<TResults, TVariables>,
): (variables: TVariables) => Promise<TResults>;
function mutate(document: RequestDocument): (variables: Variables) => Promise<unknown>;
function mutate<TResults, TVariables extends Variables = Variables>(
	document: TypedDocumentNode<TResults, TVariables>,
	variables: TVariables,
): Promise<TResults>;
function mutate(document: RequestDocument, variables: Variables): Promise<unknown>;
function mutate<TResults, TVariables extends Variables = Variables>(
	document: RequestDocument | TypedDocumentNode<TResults, TVariables>,
	variables?: TVariables,
): Promise<TResults> | ((variables: TVariables) => Promise<TResults>) {
	const documentString = typeof document === 'string' ? document : print(document);
	if (variables) {
		return awesomeClient.request(documentString, variables) as any;
	} else {
		return (variables: TVariables): Promise<TResults> => {
			return awesomeClient.request(documentString, variables) as any;
		};
	}
}

export const api = {
	query,
	mutate,
};
