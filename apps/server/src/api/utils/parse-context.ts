import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { InternalServerError } from '../../common/errors/errors';

interface GraphQLContext {
	req: Request;
	res: Response;
	isGraphQL: true;
	info: GraphQLResolveInfo;
}

/**
 * @description
 * Parses execution data from a Nestjs `ExecutionContext`
 *
 * :::info
 * It accounts for Graphql only
 * :::
 */
export function parseContext(executionContext: ExecutionContext): GraphQLContext {
	if (executionContext.getType<GqlContextType>() === 'graphql') {
		const gqlContext = GqlExecutionContext.create(executionContext as ExecutionContext);
		return {
			isGraphQL: true,
			req: gqlContext.getContext().req,
			res: gqlContext.getContext().res,
			info: gqlContext.getInfo(),
		};
	} else {
		throw new InternalServerError('errors.invalid_execution_context', {
			type: executionContext.getType(),
		});
	}
}
