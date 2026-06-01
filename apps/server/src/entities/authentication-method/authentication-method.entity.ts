import { Entity, Index, ManyToOne, TableInheritance } from 'typeorm';
import { AppEntity } from '../../common/helpers/app-entity';
import { User } from '../user/user.entity';

@Entity()
@TableInheritance({
	column: {
		name: 'type',
		type: 'varchar',
	},
})
export abstract class AuthenticationMethod extends AppEntity {
	@Index()
	@ManyToOne(
		() => User,
		(user) => user.authenticationMethods,
	)
	user: User;
}
