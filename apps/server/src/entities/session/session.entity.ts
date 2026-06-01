import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { User } from '../user/user.entity';

@Entity()
export class Session extends AppEntity {
	constructor(input: DeepPartial<Session>) {
		super(input);
	}

	/**
	 * @description
	 * Unique public facing identifier
	 */
	@Column({
		unique: true,
	})
	token: string;

	@Index()
	@ManyToOne(
		() => User,
		(user) => user.sessions,
	)
	user: User;

	@Column()
	deviceFingerprint: string;

	@Column()
	ipAddress: string;

	@Column({
		default: false,
	})
	revoked: boolean;

	/**
	 * @description
	 * Updated each time the session reaches half of its expiration duration
	 */
	@Column()
	expiresAt: Date;

	/**
	 * @description
	 * The maximum duration of the session at which the session is considered expired
	 * even if the `expiresAt` field is still early in time.
	 *
	 * :::info
	 * Specified when the session gets created and then it becomes immutable.
	 * :::
	 */
	@Column()
	absoluteExpiresAt: Date;

	/**
	 * @description
	 * The authentication strategy used to create this session (e.g., 'credentials', 'oauth', 'saml').
	 */
	@Column()
	authenticationStrategy: string;

	@OneToMany(
		() => RefreshToken,
		(token) => token.session,
	)
	refreshTokens: RefreshToken[];
}
