import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { DeepPartial } from '../../common/types/deep-partial';
import { SoftDeletable } from '../../common/types/soft-deletable';
import { User } from '../user/user.entity';

@Entity()
export class Administrator extends AppEntity implements SoftDeletable {
	constructor(input?: DeepPartial<Administrator>) {
		super(input);
	}

	@Column() firstName: string;

	@Column() lastName: string;

	@Column({
		unique: true,
	})
	identifier: string;

	@Column({
		type: 'date',
		nullable: true,
	})
	deletedAt: Date | null;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;
}
