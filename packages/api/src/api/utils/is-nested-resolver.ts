import { GraphQLResolveInfo } from 'graphql';

export function isNestedResolver(info?: GraphQLResolveInfo): boolean {
	if (!info?.parentType?.name) return false;

	return ![
		'Query',
		'Mutation',
		'Subscription',
	].includes(info.parentType.name);
}
