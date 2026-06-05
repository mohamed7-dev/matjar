import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { Company } from '../../entities/company/company.entity';
import { OrmService } from '../../orm/orm.service';

@Injectable()
export class CompanyService {
	constructor(private readonly ormService: OrmService) {}

	async getCompanyByToken(token: string): Promise<Company | undefined>;
	async getCompanyByToken(ctx: RequestContext, token: string): Promise<Company | undefined>;
	public async getCompanyByToken(
		ctxOrToken: RequestContext | string,
		maybeToken?: string,
	): Promise<Company | undefined> {
		const token = !(ctxOrToken instanceof RequestContext) ? ctxOrToken : maybeToken;
		const ctx = ctxOrToken instanceof RequestContext ? ctxOrToken : undefined;

		let company: Company | null;

		if (!ctx) {
			company = await this.ormService.dataSource.getRepository(Company).findOne({
				where: {
					token: token,
				},
			});
		} else {
			company = await this.ormService.getRepository(ctx, Company).findOne({
				where: {
					token: token,
				},
			});
		}

		return company ?? undefined;
	}
}
