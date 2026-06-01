import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { InternalServerError } from '../../common/errors/errors';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { SoftDeletable } from '../../common/types/soft-deletable';
import { AuthenticationMethod } from '../authentication-method/authentication-method.entity';
import { NativeAuthenticationMethod } from '../authentication-method/native-authentication-method.entity';
import { Role } from '../role/role.entity';
import { Session } from '../session/session.entity';

@Entity()
export class User extends AppEntity implements SoftDeletable {
	constructor(input?: DeepPartial<User>) {
		super(input);
	}

	@Column({
		type: 'date',
		nullable: true,
	})
	deletedAt: Date | null;

	@Column()
	identifier: string;

	@Column({
		type: 'date',
		nullable: true,
	})
	lastAuthenticatedAt: Date | null;

	@Column({
		default: false,
	})
	isVerified: boolean;

	@OneToMany(
		() => AuthenticationMethod,
		(authMethods) => authMethods.user,
	)
	authenticationMethods: AuthenticationMethod[];

	@OneToMany(
		() => Session,
		(sessions) => sessions.user,
	)
	sessions: Session[];

	@ManyToMany(() => Role)
	@JoinTable()
	roles: Role[];

	public nativeAuthenticationMethod(): NativeAuthenticationMethod;
	public nativeAuthenticationMethod(throwError?: boolean): NativeAuthenticationMethod | undefined;
	public nativeAuthenticationMethod(throwError?: boolean): NativeAuthenticationMethod | undefined {
		if (!this.authenticationMethods.length) {
			throw new InternalServerError('errors.authentication_methods_not_loaded');
		}
		const nativeAuthMethod = this.authenticationMethods.find(
			(aum) => aum instanceof NativeAuthenticationMethod,
		);

		if (!nativeAuthMethod && throwError) {
			throw new InternalServerError('errors.native_authentication_method_not_found');
		}

		return nativeAuthMethod;
	}
}
