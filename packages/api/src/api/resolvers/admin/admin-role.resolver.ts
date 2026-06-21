import {
	CreateRoleResult,
	DeletionResponse,
	MutationCreateRoleArgs,
	MutationDeleteRoleArgs,
	MutationDeleteRolesArgs,
	MutationUpdateRoleArgs,
	Permission,
	QueryRoleArgs,
	UpdateRoleResult,
} from '@matjar/common/lib/generated-types';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '../../../entities/role/role.entity';
import { RoleService } from '../../../services/domain/role.service';
import { ActiveUserIsCompanyMemberPolicyOptions } from '../../access-policies/active-user-is-company-member.policy';
import { Access } from '../../decorators/access.decorator';
import { Ctx } from '../../decorators/ctx.decorator';
import { RelationPaths, Relations } from '../../decorators/relations.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import { RequestContext } from '../../request-context/request-context';

@Resolver()
export class AdminRoleResolver {
	constructor(private readonly roleService: RoleService) {}

	@Query('role')
	@Access({
		permissions: [
			Permission.platform_role_read,
			Permission.company_role_read,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
		requireAllPermissions: false,
	})
	public async findOne(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryRoleArgs,
		@Relations(Role) relations: RelationPaths<Role>,
	): Promise<Role | undefined> {
		return await this.roleService.findOne(ctx, args.id, relations);
	}

	@Mutation('createRole')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_role_create,
			Permission.company_role_create,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
			{
				name: 'ActiveUserIsCompanyMemberPolicy',
				options: {
					gqlCompanyIdInputPath: 'input.companyId',
				} satisfies ActiveUserIsCompanyMemberPolicyOptions,
			},
		],
		requireAllPermissions: false,
	})
	public async create(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationCreateRoleArgs,
	): Promise<CreateRoleResult> {
		const result = await this.roleService.createRole(ctx, args.input);
		return result;
	}

	@Mutation('updateRole')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_role_update,
			Permission.company_role_update,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
			{
				name: 'ActiveUserIsCompanyMemberPolicy',
				options: {
					gqlCompanyIdInputPath: 'input.companyId',
				} satisfies ActiveUserIsCompanyMemberPolicyOptions,
			},
		],
		requireAllPermissions: false,
	})
	public async update(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationUpdateRoleArgs,
	): Promise<UpdateRoleResult> {
		const result = await this.roleService.updateRole(ctx, args.input);
		return result;
	}

	@Mutation('deleteRole')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_role_delete,
			Permission.company_role_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
		requireAllPermissions: false,
	})
	public async delete(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteRoleArgs,
	): Promise<DeletionResponse> {
		const result = await this.roleService.deleteRoles(ctx, [
			args.id,
		]);
		return result[0];
	}

	@Mutation('deleteRoles')
	@Transaction()
	@Access({
		permissions: [
			Permission.platform_role_delete,
			Permission.company_role_delete,
		],
		policies: [
			{
				name: 'AuthenticatedPolicy',
			},
		],
		requireAllPermissions: false,
	})
	public async deleteMany(
		@Ctx() ctx: RequestContext,
		@Args() args: MutationDeleteRolesArgs,
	): Promise<DeletionResponse[]> {
		const result = await this.roleService.deleteRoles(ctx, args.ids);
		return result;
	}
}
