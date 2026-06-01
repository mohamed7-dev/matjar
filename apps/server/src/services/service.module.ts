import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { OrmModule } from '../orm/orm.module';
import { AdministratorService } from './domain/administrator.service';
import { MarketplaceRegionService } from './domain/marketplace-region.service';
import { RoleService } from './domain/role.service';
import { UserService } from './domain/user.service';
import { DefaultRolesBuilderService } from './helpers/default-roles-builder.service';
import { InitializerService } from './helpers/initializer.service';
import { RequestContextService } from './helpers/request-context.service';

const helperServices = [
	RequestContextService,
	DefaultRolesBuilderService,
];

const domainsServices = [
	MarketplaceRegionService,
	RoleService,
	UserService,
	AdministratorService,
];

@Module({
	imports: [
		ConfigModule,
		OrmModule,
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
