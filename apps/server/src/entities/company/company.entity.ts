import { Column, Entity, OneToMany } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { CompanyRole } from '../role/company-role.entity';

@Entity()
export class Company extends AppEntity {
	constructor(input?: DeepPartial<Company>) {
		super(input);
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
		() => CompanyRole,
		(roles) => roles.company,
	)
	roles: CompanyRole[];
}
