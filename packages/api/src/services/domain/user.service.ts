import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { isEmailAddressLike, normalizeInput } from '../../common/utils/normalize-input';
import { NativeAuthenticationMethod } from '../../entities/authentication-method/native-authentication-method.entity';
import { User } from '../../entities/user/user.entity';
import { OrmService } from '../../orm/orm.service';
import { PasswordHashingService } from '../helpers/password-hashing.service';

@Injectable()
export class UserService {
	constructor(
		private readonly ormService: OrmService,
		private readonly passwordHashingService: PasswordHashingService,
	) {}

	public async getUserByIdentifier(ctx: RequestContext, identifier: string): Promise<User | undefined> {
		const isEmailIdentifier = isEmailAddressLike(identifier);
		const user = await this.ormService
			.getRepository(ctx, User)
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.authenticationMethods', 'authMethods')
			.leftJoinAndSelect('user.roles', 'role')
			.leftJoinAndSelect('role.marketplaceRegions', 'mpr')
			.leftJoinAndSelect('role.company', 'company')
			.where('user.deletedAt IS NULL')
			.andWhere(
				isEmailIdentifier ? 'LOWER(user.identifier) = :identifier' : 'user.identifier = :identifier',
				{
					identifier: isEmailIdentifier ? normalizeInput(identifier) : identifier,
				},
			)
			.getOne();

		return user ?? undefined;
	}

	public async getUserById(ctx: RequestContext, id: string): Promise<User | undefined> {
		const user = await this.ormService
			.getRepository(ctx, User)
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.authenticationMethods', 'authMethods')
			.leftJoinAndSelect('user.roles', 'role')
			.leftJoinAndSelect('role.marketplaceRegions', 'mpr')
			.leftJoinAndSelect('role.company', 'company')
			.where('user.deletedAt IS NULL')
			.andWhere('user.id = :id', {
				id: id,
			})
			.getOne();

		return user ?? undefined;
	}

	public async createAdministratorUser(
		ctx: RequestContext,
		credentials: {
			identifier: string;
			password: string;
		},
	): Promise<User> {
		const normalizedIdentifier = normalizeInput(credentials.identifier);
		const user = new User({
			identifier: normalizedIdentifier,
			isVerified: true,
		});

		const nativeAuthMethod = new NativeAuthenticationMethod({
			identifier: normalizedIdentifier,
			password: await this.passwordHashingService.hash(credentials.password),
		});

		const createdAuthMethod = await this.ormService
			.getRepository(ctx, NativeAuthenticationMethod)
			.save(nativeAuthMethod);

		user.authenticationMethods = [
			createdAuthMethod,
		];

		return await this.ormService.getRepository(ctx, User).save(user);
	}
}
