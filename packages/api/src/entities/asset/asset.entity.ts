import { AssetType } from '@matjar/common/lib/generated-types';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { MarketplaceRegionAware } from '../../common/types/marketplace-region-aware';
import { Taggable } from '../../common/types/taggable';
import { LocaleString, Translatable, TranslationEntity } from '../../common/types/translatable';
import { MarketplaceRegion } from '../marketplace-region/marketplace-region.entity';
import { Tag } from '../tag/tag.entity';
import { AssetTranslation } from './asset-translation.entity';

@Entity()
export class Asset extends AppEntity implements MarketplaceRegionAware, Translatable, Taggable {
	constructor(input?: DeepPartial<Asset>) {
		super(input);
	}

	name: LocaleString;

	@Column()
	type: AssetType;

	@Column()
	mimetype: string;

	@Column({
		default: 0,
	})
	width: number;

	@Column({
		default: 0,
	})
	height: number;

	@Column()
	fileSize: number;

	@Column()
	sourceIdentifier: string;

	@Column()
	previewIdentifier: string;

	@Column('simple-json', {
		nullable: true,
	})
	focalPoint?: {
		x: number;
		y: number;
	};

	@ManyToMany(() => MarketplaceRegion)
	@JoinTable()
	marketplaceRegions: MarketplaceRegion[];

	@ManyToMany(() => Tag)
	@JoinTable()
	tags: Tag[];

	@OneToMany(
		() => AssetTranslation,
		(translations) => translations.base,
		{
			eager: true,
		},
	)
	translations: Array<TranslationEntity<Asset>>;
}
