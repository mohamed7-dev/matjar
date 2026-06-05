import { GraphQLSchema } from 'graphql';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import {
	ApiError,
	adminErrorOperationTypeResolvers,
} from '../../common/errors/generated-graphql-admin-errors';
import { storeErrorOperationTypeResolvers } from '../../common/errors/generated-graphql-store-errors';
import { ApiType } from '../utils/get-api-type';

export function generateResolvers(apiType: ApiType, _schema: GraphQLSchema): any {
	const genericResolveType = {
		__resolveType(): null {
			return null;
		},
	};

	const sharedResolvers = {
		JSON: GraphQLJSON,
		DateTime: GraphQLDateTime,
		Node: genericResolveType,
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
