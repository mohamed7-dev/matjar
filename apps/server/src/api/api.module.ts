import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { I18nModule } from '../i18n/i18n.module';
import { I18nService } from '../i18n/i18n.service';
import { OrmModule } from '../orm/orm.module';
import { ServiceModule } from '../services/service.module';
import { ADMIN_TYPES_PATHS, STORE_TYPES_PATHS } from './common/types-paths';
import { initGraphqlModule } from './configure-graphql/init-graphql-module';
import { AuthenticationGuard } from './guards/authentication.guard';
import { GlobalSettingsResolver } from './resolvers/admin/global-settings.resolver';

@Module({
	imports: [
		ServiceModule,
		OrmModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthenticationGuard,
		},
	],
})
class SharedApiModule {}

@Module({
	imports: [
		SharedApiModule,
	],
	providers: [
		GlobalSettingsResolver,
	],
})
class AdminApiModule {}

@Module({
	imports: [
		SharedApiModule,
	],
})
class StoreApiModule {}

@Module({
	imports: [
		I18nModule,
		ConfigModule,
		SharedApiModule,
		AdminApiModule,
		StoreApiModule,
		initGraphqlModule((configService) => ({
			apiType: 'admin',
			apiTypesPaths: ADMIN_TYPES_PATHS,
			apiPath: configService.api.admin.path,
			enableDebugging: configService.api.admin.enableDebugging,
			enablePlayground: configService.api.admin.enablePlayground,
			resolverModules: [
				AdminApiModule,
			],
		})),
		initGraphqlModule((configService) => ({
			apiType: 'store',
			apiTypesPaths: STORE_TYPES_PATHS,
			apiPath: configService.api.store.path,
			enableDebugging: configService.api.store.enableDebugging,
			enablePlayground: configService.api.store.enablePlayground,
			resolverModules: [
				StoreApiModule,
			],
		})),
	],
})
export class ApiModule implements NestModule {
	constructor(
		private readonly configService: ConfigService,
		private readonly i18nService: I18nService,
	) {}

	configure(consumer: MiddlewareConsumer): void {
		const { admin, store } = this.configService.api;
		consumer.apply(this.i18nService.setupMiddleware()).forRoutes(admin.path, store.path);
	}
}
