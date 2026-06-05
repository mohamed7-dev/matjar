import { Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Injector } from '../common/helpers/injector';
import { LifecycleStrategy } from '../common/types/lifecycle-strategy';
import { ConfigService } from './config.service';

@Module({
	providers: [
		ConfigService,
	],
	exports: [
		ConfigService,
	],
})
export class ConfigModule implements OnApplicationShutdown, OnApplicationBootstrap {
	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
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
		const {
			sessionCacheStrategy,
			storeAuthenticationStrategies,
			adminAuthenticationStrategies,
			passwordHashingStrategy,
		} = this.configService.auth;

		const { cacheStrategy } = this.configService.system;

		return [
			sessionCacheStrategy,
			passwordHashingStrategy,
			...adminAuthenticationStrategies,
			...storeAuthenticationStrategies,
			cacheStrategy,
		];
	}
}
