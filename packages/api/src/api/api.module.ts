import {
	MiddlewareConsumer,
	Module,
	NestModule,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, ModuleRef } from '@nestjs/core';
import { Injector } from '../common/helpers/injector';
import { LifecycleStrategy } from '../common/types/lifecycle-strategy';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { I18nModule } from '../i18n/i18n.module';
import { I18nService } from '../i18n/i18n.service';
import { OrmModule } from '../orm/orm.module';
import { ServiceModule } from '../services/service.module';
import { getAllAccessPolicies } from './access-policies/get-access-policies';
import { ADMIN_TYPES_PATHS, STORE_TYPES_PATHS } from './common/types-paths';
import { initGraphqlModule } from './configure-graphql/init-graphql-module';
import { I18nExceptionLoggerFilter } from './filter/i18n-exception-logger.filter';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ApiErrorTranslationInterceptor } from './interceptors/api-error-translation.interceptor';
import { AdminAdministratorResolver } from './resolvers/admin/admin-administrator.resolver';
import { AdminAssetResolver } from './resolvers/admin/admin-asset.resolver';
import { AdminAuthResolver } from './resolvers/admin/admin-auth.resolver';
import { AdminMarketplaceRegionResolver } from './resolvers/admin/admin-marketplace-region.resolver';
import { AdminRoleResolver } from './resolvers/admin/admin-role.resolver';
import { GlobalSettingsResolver } from './resolvers/admin/global-settings.resolver';

@Module({
	imports: [
		ServiceModule,
		OrmModule.forRoot(),
		I18nModule,
		ConfigModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AuthorizationGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ApiErrorTranslationInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: I18nExceptionLoggerFilter,
		},
	],
	exports: [
		ServiceModule,
		OrmModule.forRoot(),
		I18nModule,
		ConfigModule,
	],
})
class SharedApiModule {}

@Module({
	imports: [
		SharedApiModule,
	],
	providers: [
		GlobalSettingsResolver,
		AdminAuthResolver,
		AdminAssetResolver,
		AdminAdministratorResolver,
		AdminMarketplaceRegionResolver,
		AdminRoleResolver,
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
export class ApiModule implements NestModule, OnApplicationBootstrap, OnApplicationShutdown {
	constructor(
		private readonly configService: ConfigService,
		private readonly i18nService: I18nService,
		private readonly moduleRef: ModuleRef,
	) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.initLifecycleStrategies();
	}

	async onApplicationShutdown(): Promise<void> {
		await this.destroyLifecycleStrategies();
	}

	private async initLifecycleStrategies(): Promise<void> {
		const injector = new Injector(this.moduleRef);
		for (const strategy of this.getLifecycleStrategies()) {
			if (typeof strategy.onInit === 'function') {
				await strategy.onInit(injector);
			}
		}
	}

	private async destroyLifecycleStrategies(): Promise<void> {
		for (const strategy of this.getLifecycleStrategies()) {
			if (typeof strategy.onDestroy === 'function') {
				await strategy.onDestroy();
			}
		}
	}

	private getLifecycleStrategies(): LifecycleStrategy[] {
		return getAllAccessPolicies();
	}

	async configure(consumer: MiddlewareConsumer): Promise<void> {
		const { admin, store } = this.configService.api;
		const { default: graphqlUploadExpress } = await import('graphql-upload/graphqlUploadExpress.mjs');

		consumer
			.apply(
				graphqlUploadExpress({
					maxFileSize: this.configService.asset.maxUploadSizeInBytes,
				}),
			)
			.forRoutes(admin.path, store.path);
		consumer.apply(this.i18nService.setupMiddleware()).forRoutes(admin.path, store.path);
	}
}
