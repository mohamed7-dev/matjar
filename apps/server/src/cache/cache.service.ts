import { Injectable } from '@nestjs/common';
import { JSONCompatible } from '../common/types/json-compatible';
import { ConfigService } from '../config/config.service';
import { CacheEntryOptions, CacheStrategy } from '../config/strategies/cache/cache-strategy.interface';
import { Logger } from '../logger/logger';

interface ConfigureOptions {
	generateKey: (identifier: string | number) => string;
	entryOptions?: CacheEntryOptions;
}

const ContextName = 'ConfigService';

@Injectable()
export class CacheService {
	private cacheStrategy: CacheStrategy;
	private configOptions: ConfigureOptions;

	constructor(private readonly configService: ConfigService) {
		this.cacheStrategy = this.configService.system.cacheStrategy;
	}

	public async store<Value extends JSONCompatible<Value>>(
		key: string,
		value: Value,
		options?: CacheEntryOptions,
	): Promise<void> {
		try {
			await this.cacheStrategy.store(key, value, options);
			Logger.debug(`Successfully stored key "${key}"`, ContextName);
		} catch (error) {
			Logger.error(`Failed to store key "${key}"`, ContextName, (error as Error).stack);
		}
	}

	public async retrieve<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> {
		try {
			const hit = await this.cacheStrategy.retrieve<Value>(key);
			if (!hit) {
				Logger.debug(`Hit on key "${key}"`, ContextName);
			}
			return hit;
		} catch (error) {
			Logger.error(`Failed to retrieve key "${key}"`, ContextName, (error as Error).stack);
		}
	}

	public async delete(key: string): Promise<void> {
		try {
			await this.cacheStrategy.delete(key);
			Logger.debug(`Successfully removed key "${key}"`, ContextName);
		} catch (error) {
			Logger.error(`Failed to remove key "${key}"`, ContextName, (error as Error).stack);
		}
	}

	public async purgeByTags(tags: string[]): Promise<void> {
		try {
			await this.cacheStrategy.purgeByTags(tags);
			Logger.debug(`Successfully purged cache entries with tags [${tags.join(', ')}]`, ContextName);
		} catch (error) {
			Logger.error(`Failed to purge tags [${tags.join(', ')}]`, ContextName, (error as Error).stack);
		}
	}

	public configure(config: ConfigureOptions): void {
		this.configOptions = config;
	}

	public async getOrInsert<Value extends JSONCompatible<Value>>(
		identifier: string,
		fn: () => Value | Promise<Value>,
	): Promise<Value> {
		const configOptions = this.getConfigOrThrow();
		const generatedKey = configOptions.generateKey(identifier);
		const hit = await this.retrieve<Value>(generatedKey);
		if (hit !== undefined) return hit;
		const value = await fn();
		await this.store(generatedKey, value, configOptions.entryOptions);
		return value;
	}

	public async removeBulk(idOrIds: string | number | Array<string | number>): Promise<void> {
		const config = this.getConfigOrThrow();
		const ids = Array.isArray(idOrIds)
			? idOrIds
			: [
					idOrIds,
				];
		const keys = ids.map((id) => {
			return config.generateKey(id);
		});
		await Promise.all(keys.map((key) => this.removeBulk(key)));
	}

	private getConfigOrThrow(): ConfigureOptions {
		if (!this.configOptions) {
			Logger.error(
				`Configuration is not set, make sure to call "CacheService.configure()" first`,
				ContextName,
			);
		}
		return this.configOptions;
	}
}
