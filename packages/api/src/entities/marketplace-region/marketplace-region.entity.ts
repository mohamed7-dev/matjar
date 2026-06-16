import { CurrencyCode, LanguageCode } from '@matjar/common/lib/generated-types';
import { Column, Entity, ManyToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { generateId } from '../../common/utils/generate-id';
import { Role } from '../role/role.entity';

@Entity()
export class MarketplaceRegion extends AppEntity {
	constructor(input?: DeepPartial<MarketplaceRegion>) {
		super(input);

		if (!input?.token) {
			this.token = this.generateToken();
		}
	}

	/**
	 * @description
	 * Unique identifier used to identify the marketplace region in the request header
	 */
	@Column()
	token: string;

	/**
	 * @description
	 * Unique human-readable name of the marketplace region.
	 *
	 * @example
	 * "Egypt Store" or "KSA Store"
	 */
	@Column()
	code: string;

	@Column()
	primaryLanguageCode: LanguageCode;

	@Column({
		type: 'simple-array',
	})
	availableLanguageCodes: LanguageCode[];

	@Column()
	primaryCurrencyCode: CurrencyCode;

	@Column({
		type: 'simple-array',
	})
	availableCurrencyCodes: CurrencyCode[];

	@ManyToMany(
		() => Role,
		(roles) => roles.marketplaceRegions,
	)
	roles: Role[];

	private generateToken(): string {
		return generateId();
	}
}
