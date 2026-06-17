import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';

export function isGraphQLResolveInfo(input: unknown): input is GraphQLResolveInfo {
	return !!(input && typeof input === 'object' && (input as any).schema instanceof GraphQLSchema);
}
