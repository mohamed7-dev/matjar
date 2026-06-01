import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { normalizeInput } from '../../common/utils/normalize-input';
import { NativeAuthenticationMethod } from '../../entities/authentication-method/native-authentication-method.entity';
import { User } from '../../entities/user/user.entity';
import { OrmService } from '../../orm/orm.service';

@Injectable()
export class UserService {
	constructor(private readonly ormService: OrmService) {}

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
			// password: await this.passwordHashingService.hash(credentials.password),
			password: credentials.password, // TODO: hash password before storing it
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
