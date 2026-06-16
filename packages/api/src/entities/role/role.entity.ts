import { Permission } from '@matjar/common/lib/generated-types';
import { Column, Entity, JoinTable, ManyToMany, TableInheritance } from 'typeorm';
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
}
