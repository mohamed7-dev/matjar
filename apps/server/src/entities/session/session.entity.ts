import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { MarketplaceRegion } from '../marketplace-region/marketplace-region.entity';
import { User } from '../user/user.entity';

// TODO: don't forget to add the active order

@Entity()
export class Session extends AppEntity {
	constructor(input: DeepPartial<Session>) {
		super(input);
	}

	/**
	 * @description
	 * Unique public facing identifier
	 */
	@Index({
		unique: true,
	})
	@Column()
	token: string;

	@Column()
	expiresAt: Date;

	@Column()
	revoked: boolean;

	/**
	 * @description
	 * The authentication strategy used to create this session (e.g., 'native', 'oauth', 'saml').
	 */
	@Column()
	authenticationStrategy: string;

	@Index()
	@ManyToOne(
		() => User,
		(user) => user.sessions,
	)
	user: User;

	@Index()
	@ManyToOne(() => MarketplaceRegion)
	activeMarketplaceRegion: MarketplaceRegion | null;
}
