import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { CacheService } from './cache.service';

@Module({
	imports: [
		ConfigModule,
	],
	providers: [
		CacheService,
	],
	exports: [
		CacheService,
	],
})
export class CacheModule {}
