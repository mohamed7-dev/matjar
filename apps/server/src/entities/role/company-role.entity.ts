import { ChildEntity, ManyToOne, Unique } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
import { Company } from '../company/company.entity';
import { Role } from './role.entity';

@Unique([
	'company',
	'code',
])
@ChildEntity()
export class CompanyRole extends Role {
	constructor(input?: DeepPartial<CompanyRole>) {
		super(input);
		this.isSystem = false;
	}

	@ManyToOne(
		() => Company,
		(company) => company.roles,
		{
			onDelete: 'CASCADE',
		},
	)
	company: Company;
}
