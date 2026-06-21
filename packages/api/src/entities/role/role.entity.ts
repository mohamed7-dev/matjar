import { Permission } from '@matjar/common/lib/generated-types';
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { Company } from '../company/company.entity';
import { MarketplaceRegion } from '../marketplace-region/marketplace-region.entity';

@Index(
	[
		'company',
		'code',
	],
	{
		unique: true,
	},
)
// @Index(
// 	[
// 		'code',
// 	],
// 	{
// 		unique: true,
// 		where: 'companyId IS NULL',
// 	},
// )
@Entity()
export class Role extends AppEntity implements MarketplaceRegionAware {
	constructor(input?: DeepPartial<Role>) {
		super(input);
	}

	/**
	 * @description
	 * Unique identifier of the role
	 */
	@Column()
	code: string;

	@Column()
	description: string;

	@Column({
		type: 'simple-array',
	})
	permissions: Permission[];

	@Column({
		default: false,
	})
	isSystem: boolean;

	@ManyToMany(
		() => MarketplaceRegion,
		(marketplaceRegions) => marketplaceRegions.roles,
	)
	@JoinTable()
	marketplaceRegions: MarketplaceRegion[];

	@ManyToOne(
		() => Company,
		(company) => company.roles,
		{
			onDelete: 'CASCADE',
			nullable: true,
		},
	)
	company?: Company | null;
}
