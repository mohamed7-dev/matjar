import { CurrencyCode, LanguageCode } from '@matjar/common/lib/generated-types';
import { Column, Entity, ManyToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { generateId } from '../../common/utils/generate-id';
import { Company } from '../company/company.entity';
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
	@Column({
		unique: true,
	})
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

	@Column('varchar')
	primaryLanguageCode: LanguageCode;

	@Column({
		type: 'simple-array',
		nullable: true,
	})
	availableLanguageCodes: LanguageCode[];

	@Column('varchar')
	primaryCurrencyCode: CurrencyCode;

	@Column({
		type: 'simple-array',
		nullable: true,
	})
	availableCurrencyCodes: CurrencyCode[];

	@ManyToMany(
		() => Role,
		(roles) => roles.marketplaceRegions,
		{
			onDelete: 'CASCADE',
		},
	)
	roles: Role[];

	@ManyToMany(
		() => Company,
		(companies) => companies.marketplaceRegions,
	)
	companies: Company[];

	private generateToken(): string {
		return generateId();
	}
}
