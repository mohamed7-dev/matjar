import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../request-context/request-context';
import { resolveRequestContext } from '../request-context/request-context-utils';
import { isNestedResolver } from '../utils/is-nested-resolver';
import { parseContext } from '../utils/parse-context';

export const Ctx = createParamDecorator((_data, context: ExecutionContext): RequestContext | undefined => {
	const { info, req } = parseContext(context);
	const isNested = isNestedResolver(info);
	const requestContext = resolveRequestContext(req, isNested ? undefined : context);

	return requestContext;
});
