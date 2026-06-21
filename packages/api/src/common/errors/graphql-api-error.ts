import { AppEntity } from '../helpers/app-entity';

/**
 * @description
 * GraphqlApiError represents a GraphQL API error with status code and message.
 */
export class GraphqlApiError {
	errorCode: string;
	message: string;
}

// exclude result if it doesn't extend the GraphqlApiError
export type JustErrorResults<Result extends GraphqlApiError | U, U = any> = Exclude<
	Result,
	Result extends GraphqlApiError ? never : Result
>;

// union of a GraphqlApiError and AppEntity
export type ErrorResultUnion<Result extends GraphqlApiError | U, Entity extends AppEntity, U = any> =
	| JustErrorResults<Result>
	| Entity;

/**
 * @description
 * Type guard function to check if a result is a GraphQL API error.
 * Used to determine if a service method returned an error or a successful result.
 */
export function isGraphqlApiError<Result extends GraphqlApiError | U, U = any>(
	input: Result,
): input is JustErrorResults<Result>;
export function isGraphqlApiError<Result, Entity extends AppEntity>(
	input: ErrorResultUnion<Result, Entity>,
): input is JustErrorResults<ErrorResultUnion<Result, Entity>> {
	return (
		input &&
		!!(
			(input as unknown as GraphqlApiError).errorCode &&
			(input as unknown as GraphqlApiError).message != null
		) &&
		(input as any).__typename
	);
}
