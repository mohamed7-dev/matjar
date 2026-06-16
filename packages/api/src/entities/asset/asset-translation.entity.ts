import { LanguageCode } from '@matjar/common/lib/generated-types';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { TranslationEntity } from '../../common/types/translatable';
import { Asset } from './asset.entity';

@Entity()
export class AssetTranslation extends AppEntity implements TranslationEntity<Asset> {
	constructor(input?: DeepPartial<AssetTranslation>) {
		super(input);
	}

	@Column()
	name: string;

	@Column()
	languageCode: LanguageCode;

	@Index()
	@ManyToOne(
		() => Asset,
		(base) => base.translations,
		{
			onDelete: 'CASCADE',
		},
	)
	base: Asset;
}
