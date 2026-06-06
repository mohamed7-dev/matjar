import { GraphQLSchema } from 'graphql';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import {
	ApiError,
	adminErrorOperationTypeResolvers,
} from '../../common/errors/generated-graphql-admin-errors';
import { storeErrorOperationTypeResolvers } from '../../common/errors/generated-graphql-store-errors';
import { ApiType } from '../utils/get-api-type';

export async function generateResolvers(apiType: ApiType, _schema: GraphQLSchema): Promise<any> {
	const genericResolveType = {
		__resolveType(): null {
			return null;
		},
	};

	const { default: GraphQLUpload } = await import('graphql-upload/GraphQLUpload.mjs');

	const sharedResolvers = {
		JSON: GraphQLJSON,
		DateTime: GraphQLDateTime,
		Node: genericResolveType,
		Upload: GraphQLUpload || genericResolveType,
		ApiError: {
			__resolveType(value: ApiError): any {
				return value.__typename;
			},
		},
	};

	const adminResolvers = {
		...adminErrorOperationTypeResolvers,
	};

	const storeResolvers = {
		...storeErrorOperationTypeResolvers,
	};

	const resolvers =
		apiType === 'admin'
			? {
					...sharedResolvers,
					...adminResolvers,
				}
			: {
					...sharedResolvers,
					...storeResolvers,
				};
	return resolvers;
}
