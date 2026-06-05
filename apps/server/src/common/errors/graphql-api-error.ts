import { AppEntity } from '../helpers/app-entity';

/**
 * @description
 * GraphqlApiError represents a GraphQL API error with status code and message.
 */
export class GraphqlApiError {
	code: string;
	message: string;
}

export type JustErrorResults<T extends GraphqlApiError | U, U = any> = Exclude<
	T,
	T extends GraphqlApiError ? never : T
>;

export type ErrorResultUnion<T extends GraphqlApiError | U, E extends AppEntity, U = any> =
	| JustErrorResults<T>
	| E;

/**
 * @description
 * Type guard function to check if a result is a GraphQL API error.
 * Used to determine if a service method returned an error or a successful result.
 */
export function isGraphqlApiError<T extends GraphqlApiError | U, U = any>(
	input: T,
): input is JustErrorResults<T>;
export function isGraphqlApiError<T, E extends AppEntity>(
	input: ErrorResultUnion<T, E>,
): input is JustErrorResults<ErrorResultUnion<T, E>> {
	return (
		input &&
		!!(
			(input as unknown as GraphqlApiError).code &&
			(input as unknown as GraphqlApiError).message != null
		) &&
		(input as any).__typename
	);
}
