import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '../config/config.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { OrmModule } from '../orm/orm.module';
import { AdministratorService } from './domain/administrator.service';
import { AssetService } from './domain/asset.service';
import { AuthService } from './domain/auth.service';
import { CompanyService } from './domain/company.service';
import { MarketplaceRegionService } from './domain/marketplace-region.service';
import { RoleService } from './domain/role.service';
import { SessionService } from './domain/session.service';
import { UserService } from './domain/user.service';
import { DefaultRolesBuilderService } from './helpers/default-roles-builder.service';
import { InitializerService } from './helpers/initializer.service';
import { ListQueryBuilder } from './helpers/list-query-builder/list-query-builder.service';
import { PasswordHashingService } from './helpers/password-hashing.service';
import { RequestContextService } from './helpers/request-context.service';
import { TranslatableSaver } from './helpers/translatable-saver/translatable-saver.service';
import { TranslatorService } from './helpers/translator.service';

const helperServices = [
	RequestContextService,
	DefaultRolesBuilderService,
	PasswordHashingService,
	TranslatorService,
	ListQueryBuilder,
	TranslatableSaver,
];

const domainsServices = [
	MarketplaceRegionService,
	RoleService,
	UserService,
	AdministratorService,
	AuthService,
	SessionService,
	CompanyService,
	AssetService,
];

@Module({
	imports: [
		ConfigModule,
		OrmModule,
		EventBusModule,
		CacheModule,
	],
	providers: [
		...domainsServices,
		...helperServices,
		InitializerService,
	],
	exports: [
		...domainsServices,
		...helperServices,
	],
})
export class ServiceModule {}
