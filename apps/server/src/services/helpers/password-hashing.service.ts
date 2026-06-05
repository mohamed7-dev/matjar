import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class PasswordHashingService {
	constructor(private readonly configService: ConfigService) {}

	public async hash(plainPassword: string): Promise<string> {
		return await this.configService.auth.passwordHashingStrategy.hash(plainPassword);
	}

	public async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
		return await this.configService.auth.passwordHashingStrategy.verify(hashedPassword, plainPassword);
	}
}
