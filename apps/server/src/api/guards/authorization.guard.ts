import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '../../common/errors/errors';
import { getAllAccessPolicies } from '../access-policies/get-access-policies';
import {
	ACCESS_DECORATOR_METADATA_KEY,
	AccessDecoratorMetadataOptions,
} from '../decorators/access.decorator';
import { RequestContext } from '../request-context/request-context';
import { resolveRequestContext } from '../request-context/request-context-utils';
import { parseContext } from '../utils/parse-context';

@Injectable()
export class AuthorizationGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const { req } = parseContext(ctx);
		const requestContext = resolveRequestContext(req, ctx);
		if (!requestContext) throw new ForbiddenError();

		const options = this.reflector.get<AccessDecoratorMetadataOptions>(
			ACCESS_DECORATOR_METADATA_KEY,
			ctx.getHandler(),
		);

		// No authorization required
		if (!options) return true;

		this.checkPermissions(requestContext, options);
		await this.runPolicies(requestContext, options);
		return true;
	}

	private checkPermissions(context: RequestContext, options: AccessDecoratorMetadataOptions): void {
		if (!options.permissions?.length) return;

		const requireAll = options.requireAllPermissions ?? true;

		const allowed = requireAll
			? context.hasAllPermissions(options.permissions)
			: context.hasAnyPermission(options.permissions);

		if (!allowed) throw new ForbiddenError();
	}

	private async runPolicies(
		context: RequestContext,
		options: AccessDecoratorMetadataOptions,
	): Promise<void> {
		if (!options.policies?.length) return;
		const allAccessPolicies = getAllAccessPolicies();
		for (const policy of options.policies) {
			// 1. Find the blueprint from your registered policies
			const blueprint = allAccessPolicies.find((p) => p.constructor.name === policy.name);

			if (!blueprint) throw new ForbiddenError();

			// 2. Create a specific instance for THIS route
			const configuredPolicy = blueprint.withConfig
				? blueprint.withConfig(policy.options ?? {})
				: blueprint;

			// 3. Evaluate
			const result = await configuredPolicy.evaluate(context);
			if (!result) throw new ForbiddenError();
		}
	}
}
