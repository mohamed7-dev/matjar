import bcrypt from 'bcryptjs';
import { PasswordHashingStrategy } from './password-hashing-strategy.interface';

export class BcryptPasswordHashingStrategy implements PasswordHashingStrategy {
	private readonly saltRound = 10;

	async hash(plainPassword: string): Promise<string> {
		return await bcrypt.hash(plainPassword, this.saltRound);
	}

	async verify(passwordHash: string, plainPassword: string): Promise<boolean> {
		return await bcrypt.compare(plainPassword, passwordHash);
	}
}
