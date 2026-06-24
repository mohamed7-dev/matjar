import {
	DeletionResponse,
	MutationAssignRoleToAdministratorArgs,
	MutationCreateAdministratorArgs,
	MutationDeleteAdministratorArgs,
	MutationDeleteAdministratorsArgs,
	MutationUpdateActiveAdministratorArgs,
	MutationUpdateAdministratorArgs,
	Permission,
	QueryAdministratorArgs,
	QueryAdministratorsArgs,
} from '@matjar/common/lib/generated-types';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginatedList } from '../../../common/types/paginated-list';
import { Administrator } from '../../../entities/administrator/administrator.entity';
import { AdministratorService } from '../../../services/domain/administrator.service';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RelationPaths, Relations } from '../../decorators/relations.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
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
			return await this.administratorService.getOneByUserId(ctx.activeUserId, ctx);
		}
	}

	@Query('administrator')
	@Access({
		permissions: [
			Permission.platform_administrator_read,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async findOne(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryAdministratorArgs,
		@Relations(Administrator) relations: RelationPaths<Administrator>,
	): Promise<Administrator | undefined> {
		return await this.administratorService.findOne(ctx, args.id, relations);
	}

	@Query('administrators')
	@Access({
		permissions: [
			Permission.platform_administrator_read,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	administrators(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryAdministratorsArgs,
		@Relations(Administrator) relations: RelationPaths<Administrator>,
	): Promise<PaginatedList<Administrator>> {
		return this.administratorService.findAll(ctx, args.options || undefined, relations);
	}

	@Mutation('createAdministrator')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_administrator_create,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async create(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationCreateAdministratorArgs,
	): Promise<Administrator> {
		return await this.administratorService.createAdministrator(ctx, args.input);
	}

	@Mutation('updateAdministrator')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_administrator_update,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async update(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationUpdateAdministratorArgs,
	): Promise<Administrator> {
		return await this.administratorService.updateAdministrator(ctx, args.input);
	}

	@Mutation('updateActiveAdministrator')
	@Transaction()
	@Access({
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async updateActiveAdmin(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationUpdateActiveAdministratorArgs,
	): Promise<Administrator | undefined> {
		if (ctx.activeUserId) {
			const admin = await this.administratorService.getOneByUserId(ctx.activeUserId, ctx);
			if (admin) {
				return await this.administratorService.updateAdministrator(ctx, {
					...args.input,
					id: admin.id,
				});
			}
		}
	}

	@Mutation('assignRoleToAdministrator')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_administrator_update,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async assignRole(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationAssignRoleToAdministratorArgs,
	): Promise<Administrator> {
		return this.administratorService.assignRoleToAdministrator(ctx, args.administratorId, args.roleId);
	}

	@Mutation('deleteAdministrator')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_administrator_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async delete(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteAdministratorArgs,
	): Promise<DeletionResponse> {
		return await this.administratorService
			.deleteAdministrators(ctx, [
				args.id,
			])
			.then((res) => res[0]);
	}

	@Mutation('deleteAdministrators')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_administrator_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
	})
	public async deleteMany(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteAdministratorsArgs,
	): Promise<DeletionResponse[]> {
		return await this.administratorService.deleteAdministrators(ctx, args.ids);
	}
}
