import { GraphQLResolveInfo } from 'graphql';

export type ApiType = 'admin' | 'store';

export function getApiType(info?: GraphQLResolveInfo): ApiType {
	const mutationType = info?.schema.getMutationType();
	return mutationType?.getFields().updateGlobalSettings ? 'admin' : 'store';
}
