import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdministratorService } from '../domain/administrator.service';
import { MarketplaceRegionService } from '../domain/marketplace-region.service';
import { RoleService } from '../domain/role.service';

@Injectable()
export class InitializerService implements OnModuleInit {
	constructor(
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly roleService: RoleService,
		private readonly administratorService: AdministratorService,
	) {}

	async onModuleInit(): Promise<void> {
		await this.marketplaceRegionService.initMarketplaceRegions();
		await this.roleService.initRoles();
		await this.administratorService.initAdministrators();
	}
}
