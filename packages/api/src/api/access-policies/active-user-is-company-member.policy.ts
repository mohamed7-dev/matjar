import { ExecutionContext } from '@nestjs/common';
import { Injector } from '../../common/helpers/injector';
import { getByPath } from '../../common/utils/get-by-path';
import { RequestContext } from '../request-context/request-context';
import { parseContext } from '../utils/parse-context';
import { AccessPolicy } from './access-policy.interface';

export interface ActiveUserIsCompanyMemberPolicyOptions {
	gqlCompanyIdInputPath: string;
}

export class ActiveUserIsCompanyMemberPolicy implements AccessPolicy {
	private companyService: import('../../services/domain/company.service').CompanyService;
	private config: ActiveUserIsCompanyMemberPolicyOptions;

	async onInit(injector: Injector): Promise<void> {
		const { CompanyService } = await import('../../services/domain/company.service.js');
		this.companyService = injector.get(CompanyService);
	}

	withConfig(options: ActiveUserIsCompanyMemberPolicyOptions): ActiveUserIsCompanyMemberPolicy {
		const instance = new ActiveUserIsCompanyMemberPolicy();
		instance.companyService = this.companyService;
		instance.config = options;
		return instance;
	}

	async evaluate(ctx: RequestContext, executionContext: ExecutionContext): Promise<boolean> {
		const { args } = parseContext(executionContext);
		const companyId = getByPath(args, this.config.gqlCompanyIdInputPath);
		if (!companyId) {
			return true;
		}

		// TODO: check if the active user is a member in this company

		return true;
	}
}
