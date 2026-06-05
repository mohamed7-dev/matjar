import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import { buildASTSchema, GraphQLInputObjectType, GraphQLSchema, isInputObjectType } from 'graphql';
import { InternalServerError } from '../../common/errors/errors';
import { AuthenticationStrategy } from '../../config/strategies/auth/authentication-strategy.interface';

export function generateAuthInputType(
	schema: GraphQLSchema,
	authenticationStrategies: AuthenticationStrategy[],
): GraphQLSchema {
	const strategySchemas: GraphQLSchema[] = [];

	const authenticationInput = new GraphQLInputObjectType({
		name: 'AuthenticationInput',
		fields: authenticationStrategies.reduce(
			(acc, strategy) => {
				const inputSchema = buildASTSchema(strategy.defineGraphqlInputType());
				const inputType = Object.values(inputSchema.getTypeMap()).find(
					(type): type is GraphQLInputObjectType => isInputObjectType(type),
				);
				if (!inputType) {
					throw new InternalServerError(
						`${strategy.constructor.name}.defineGraphqlInputType() does not define a GraphQL Input type`,
					);
				}
				strategySchemas.push(inputSchema);

				acc[strategy.name] = {
					type: inputType,
				};
				return acc;
			},
			{} as Record<
				string,
				{
					type: GraphQLInputObjectType;
				}
			>,
		),
	});

	return stitchSchemas({
		subschemas: [
			schema,
			...strategySchemas,
		],
		types: [
			authenticationInput,
		],
		typeMergingOptions: {
			validationSettings: {
				validationLevel: ValidationLevel.Off,
			},
		},
	});
}
