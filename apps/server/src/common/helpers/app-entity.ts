import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeepPartial } from '../types/deep-partial';

export abstract class AppEntity {
	protected constructor(input?: DeepPartial<AppEntity>) {
		if (input) {
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
				(this as any)[key] = descriptor.value;
			}
		}
	}

	@PrimaryGeneratedColumn()
	id: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
