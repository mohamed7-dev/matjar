import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from './config/config.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { I18nModule } from './i18n/i18n.module';
import { OrmModule } from './orm/orm.module';

@Module({
	imports: [
		ConfigModule,
		CacheModule,
		EventBusModule,
		ApiModule,
		OrmModule.forRoot(),
		I18nModule,
	],
})
export class AppModule {}
