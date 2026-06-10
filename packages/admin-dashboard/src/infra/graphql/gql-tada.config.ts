import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-env.js';

export const graphql = initGraphQLTada<{
	disableMasking: true;
	introspection: introspection;
	scalars: {
		DateTime: string;
		JSON: any;
		Money: number;
	};
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
