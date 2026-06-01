import { Check, Column, Entity, Index, JoinTable, ManyToMany, TableInheritance } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { MarketplaceRegion } from '../marketplace-region/marketplace-region.entity';

@Entity()
@TableInheritance({
	column: {
		name: 'type',
		type: 'varchar',
	},
})
@Check(`"companyId" IS NULL OR "isSystem" = false`) // company can't set isSystem: true
@Index(
	'UIX_role_code_platform',
	[
		'code',
	],
	{
		unique: true,
		where: '"companyId" IS NULL',
	},
) // code must be unique if platform role type
export abstract class Role extends AppEntity implements MarketplaceRegionAware {
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
	permissions: string[]; // TODO: change

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
}
