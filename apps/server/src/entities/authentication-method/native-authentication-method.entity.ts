import { ChildEntity, Column } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
import { AuthenticationMethod } from './authentication-method.entity';

@ChildEntity()
export class NativeAuthenticationMethod extends AuthenticationMethod {
	constructor(input?: DeepPartial<NativeAuthenticationMethod>) {
		super(input);
	}

	@Column()
	identifier: string;

	@Column()
	password: string;

	@Column({
		type: 'varchar',
		nullable: true,
	})
	verificationToken: string | null;

	@Column({
		type: 'varchar',
		nullable: true,
	})
	passwordResetToken: string | null;

	@Column({
		type: 'varchar',
		nullable: true,
	})
	identifierChangeToken: string | null;

	@Column({
		type: 'varchar',
		nullable: true,
	})
	identifierPlaceholder: string | null;
}
