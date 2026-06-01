import { Column, Entity, ManyToOne } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { Session } from '../session/session.entity';

@Entity()
export class RefreshToken extends AppEntity {
	constructor(input?: DeepPartial<RefreshToken>) {
		super(input);
	}

	@ManyToOne(
		() => Session,
		(session) => session.refreshTokens,
		{
			onDelete: 'CASCADE',
		},
	)
	session: Session;

	@Column()
	tokenHash: string;

	@Column()
	expiresAt: Date;

	@Column({
		default: false,
	})
	revoked: boolean;

	@Column({
		nullable: true,
	})
	replacedByTokenHash: string;

	@Column()
	ipAddress: string;

	@Column()
	deviceFingerprint: string;
}
