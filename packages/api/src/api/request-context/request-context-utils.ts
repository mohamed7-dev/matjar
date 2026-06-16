import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { EntityManager } from 'typeorm';
import {
	REQUEST_CONTEXT_KEY,
	REQUEST_CONTEXT_MAP_KEY,
	TRANSACTION_MANAGER_KEY,
} from '../../common/constants/keys';
import { RequestContext } from './request-context';

interface RequestContextBucket {
	base: RequestContext;
	transactional?: RequestContext;
}

export interface RequestWithContext extends Request {
	[REQUEST_CONTEXT_MAP_KEY]?: Map<() => void, RequestContextBucket>;
	[REQUEST_CONTEXT_KEY]?: RequestContextBucket;
}

export function attachRequestContext(
	requestContext: RequestContext,
	req: RequestWithContext | Request,
	executionContext: ExecutionContext,
): void {
	let bucket: RequestContextBucket | undefined;
	if (executionContext.getHandler) {
		const map =
			(req as any)[REQUEST_CONTEXT_MAP_KEY] ||
			(new Map<() => void, RequestContextBucket>() as Map<() => void, RequestContextBucket>);
		const handler = executionContext.getHandler();
		bucket = map.get(handler) as RequestContextBucket | undefined;

		const hasTransaction = Object.getOwnPropertySymbols(requestContext).includes(TRANSACTION_MANAGER_KEY);
		if (bucket) {
			bucket.base ??= requestContext;
			if (hasTransaction) bucket.transactional = requestContext;
		} else {
			bucket = {
				base: requestContext,
			};
			if (hasTransaction) bucket.transactional = requestContext;
		}
		map.set(handler, bucket);
		(req as any)[REQUEST_CONTEXT_MAP_KEY] = map;
	}

	(req as any)[REQUEST_CONTEXT_KEY] = bucket ?? {
		base: requestContext,
	};
}

export function resolveRequestContext(
	req: RequestWithContext | Request,
	executionContext?: ExecutionContext,
): RequestContext | undefined {
	if (executionContext?.getHandler) {
		const map = (req as any)[REQUEST_CONTEXT_MAP_KEY] as Map<() => void, RequestContextBucket>;

		const handler = executionContext.getHandler() as () => void;
		const mapBucket = map.get(handler);
		if (mapBucket) {
			return mapBucket?.transactional ?? mapBucket.base;
		}
	}

	const baseBucket = (req as any)[REQUEST_CONTEXT_KEY] as RequestContextBucket | undefined;

	const txManager = (baseBucket?.transactional as any)?.[TRANSACTION_MANAGER_KEY] as EntityManager;

	if (txManager?.queryRunner?.isReleased === false) {
		return baseBucket?.transactional as RequestContext;
	}

	return baseBucket?.base as RequestContext;
}
