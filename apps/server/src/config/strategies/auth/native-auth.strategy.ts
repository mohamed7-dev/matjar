import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { RequestContext } from '../../../api/request-context/request-context';
import { Injector } from '../../../common/helpers/injector';
import { NativeAuthenticationMethod } from '../../../entities/authentication-method/native-authentication-method.entity';
import { User } from '../../../entities/user/user.entity';
import { AuthenticationStrategy } from './authentication-strategy.interface';

export const NATIVE_AUTH_STRATEGY_NAME = 'native';

interface NativeAuthStrategyData {
	identifier: string;
	password: string;
}

export class NativeAuthStrategy implements AuthenticationStrategy<NativeAuthStrategyData> {
	private userService: import('../../../services/domain/user.service').UserService;
	private passwordHashingService: import('../../../services/helpers/password-hashing.service').PasswordHashingService;
	private ormService: import('../../../orm/orm.service').OrmService;

	async onInit(injector: Injector): Promise<void> {
		const { UserService } = await import('../../../services/domain/user.service.js');
		const { PasswordHashingService } = await import(
			'../../../services/helpers/password-hashing.service.js'
		);
		const { OrmService } = await import('../../../orm/orm.service.js');
		this.userService = injector.get(UserService);
		this.passwordHashingService = injector.get(PasswordHashingService);
		this.ormService = injector.get(OrmService);
	}

	name: string = NATIVE_AUTH_STRATEGY_NAME;

	defineGraphqlInputType(): DocumentNode {
		return gql`
            input NativeAuthInput {
                identifier: String!
                password: String!
            }
        `;
	}

	async authenticate(ctx: RequestContext, authData: NativeAuthStrategyData): Promise<User | false> {
		const user = await this.userService.getUserByIdentifier(ctx, authData.identifier);

		if (!user) return false;

		const nativeAuthMethod = user.getNativeAuthenticationMethod();
		const nativeAuthMethodWithPassword = await this.ormService
			.getRepository(ctx, NativeAuthenticationMethod)
			.findOne({
				where: {
					id: nativeAuthMethod.id,
				},
				select: {
					password: true,
				},
			});
		const hashedPassword = nativeAuthMethodWithPassword?.password ?? '';
		if (!hashedPassword) return false;
		const match = this.passwordHashingService.verify(authData.password, hashedPassword);
		if (!match) return false;

		return user;
	}
}
