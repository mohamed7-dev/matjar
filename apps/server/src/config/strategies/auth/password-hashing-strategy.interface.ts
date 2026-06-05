import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy';

export interface PasswordHashingStrategy extends LifecycleStrategy {
	hash(plainPassword: string): Promise<string> | string;
	verify(passwordHash: string, plainPassword: string): Promise<boolean> | boolean;
}
