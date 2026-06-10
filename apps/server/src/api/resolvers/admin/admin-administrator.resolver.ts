import { Administrator } from '@matjar/common/lib/generated-types';
import { Query, Resolver } from '@nestjs/graphql';
import { AdministratorService } from '../../../services/domain/administrator.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver()
export class AdminAdministratorResolver {
	constructor(private readonly administratorService: AdministratorService) {}

	@Query('activeAdministrator')
	@Access({
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async activeAdministrator(@Ctx() ctx: RequestContext): Promise<Administrator | undefined> {
		if (ctx.activeUserId) {
			return await this.administratorService.getOneByUserId(ctx, ctx.activeUserId);
		}
	}
}
