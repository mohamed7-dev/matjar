import { ChildEntity, Column } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
import { AuthenticationMethod } from './authentication-method.entity';

@ChildEntity()
export class ExternalAuthenticationMethod extends AuthenticationMethod {
	constructor(input?: DeepPartial<ExternalAuthenticationMethod>) {
		super(input);
	}

	/**
	 * @description
	 * The user's identifier within the external provider's system.
	 * This is typically the unique ID assigned by the provider.
	 */
	@Column()
	identifier: string;

	/**
	 * @description
	 * The name of the external authentication provider (e.g., 'google', 'facebook', 'github').
	 */
	@Column()
	provider: string;

	/**
	 * @description
	 * Provider-specific metadata stored as JSON.
	 * Contains additional information from the external provider
	 * such as profile data, tokens, or other provider-specific fields.
	 */
	@Column({
		type: 'simple-json',
	})
	metadata: any;
}
