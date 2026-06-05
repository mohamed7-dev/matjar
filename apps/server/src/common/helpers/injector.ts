import { Type } from '@nestjs/common';
import { ContextId, ModuleRef } from '@nestjs/core';

export class Injector {
	constructor(private readonly moduleRef: ModuleRef) {}

	public get<TInput = any, TResult = TInput>(
		typeOrToken: string | symbol | Function | Type<TInput>,
	): TResult {
		return this.moduleRef.get(typeOrToken, {
			strict: false,
		});
	}

	public async resolve<TInput = any, TResult = TInput>(
		typeOrToken: string | symbol | Function | Type<TInput>,
		contextId?: ContextId,
	): Promise<TResult> {
		return this.moduleRef.resolve(typeOrToken, contextId, {
			strict: false,
		});
	}
}
