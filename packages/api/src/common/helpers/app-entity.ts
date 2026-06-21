import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeepPartial } from '../types/deep-partial';

export abstract class AppEntity {
	protected constructor(input?: DeepPartial<AppEntity>) {
		if (input) {
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
				// we should skip getters decorated with @Calculated() since this is going to be copied
				// over to the instance by a typeorm subscriber
				(this as any)[key] = descriptor.value;
			}
		}
	}

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
