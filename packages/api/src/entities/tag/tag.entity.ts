import { Column, Entity } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';

@Entity()
export class Tag extends AppEntity {
	constructor(input?: DeepPartial<Tag>) {
		super(input);
	}

	@Column()
	value: string;
}
