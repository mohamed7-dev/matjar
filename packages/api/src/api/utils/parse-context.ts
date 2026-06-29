import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { InternalServerError } from '../../common/errors/errors';

interface GraphQLContext {
	req: Request;
	res: Response;
	isGraphQL: boolean;
	info: GraphQLResolveInfo | undefined;
	args: any;
}

/**
 * @description
 * Parses execution data from a Nestjs `ExecutionContext`
 *
 * :::info
 * It accounts for Graphql, and http only
 * :::
 */
export function parseContext(executionContext: ExecutionContext | ArgumentsHost): GraphQLContext {
	if (executionContext.getType<GqlContextType>() === 'graphql') {
		const gqlContext = GqlExecutionContext.create(executionContext as ExecutionContext);
		return {
			isGraphQL: true,
			req: gqlContext.getContext().req,
			res: gqlContext.getContext().res,
			info: gqlContext.getInfo(),
			args: gqlContext.getArgs(),
		};
	} else if (executionContext.getType() === 'http') {
		// we need to support http to be able to serve static assets
		// of the local storage strategy
		const httpContext = executionContext.switchToHttp();
		return {
			isGraphQL: false,
			req: httpContext.getRequest(),
			res: httpContext.getResponse(),
			info: undefined,
			args: undefined,
		};
	} else {
		throw new InternalServerError('errors.invalid_execution_context', {
			type: executionContext.getType(),
		});
	}
}
