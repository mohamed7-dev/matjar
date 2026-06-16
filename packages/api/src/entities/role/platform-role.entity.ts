import { ChildEntity } from 'typeorm';
import { DeepPartial } from '../../common/types/deep-partial';
import { Role } from './role.entity';

@ChildEntity()
export class PlatformRole extends Role {
	constructor(input?: DeepPartial<PlatformRole>) {
		super(input);
		this.isSystem = true;
	}
}
