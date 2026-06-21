import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { generateId } from '../../common/utils/generate-id';
import { MarketplaceRegion } from '../marketplace-region/marketplace-region.entity';
import { Role } from '../role/role.entity';

@Entity()
export class Company extends AppEntity implements MarketplaceRegionAware {
	constructor(input?: DeepPartial<Company>) {
		super(input);
		if (!input?.token) {
			this.token = this.generateToken();
		}
	}

	@Column({
		unique: true,
	})
	code: string;

	@Column({
		unique: true,
	})
	token: string;

	@OneToMany(
		() => Role,
		(roles) => roles.company,
	)
	roles: Role[];

	@ManyToMany(
		() => MarketplaceRegion,
		(marketplaceRegions) => marketplaceRegions.companies,
	)
	@JoinTable()
	marketplaceRegions: MarketplaceRegion[];

	private generateToken(): string {
		return generateId();
	}
}
