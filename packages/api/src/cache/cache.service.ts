import { Injectable } from '@nestjs/common';
import { JSONCompatible } from '../common/types/json-compatible';
import { ConfigService } from '../config/config.service';
import { CacheEntryOptions, CacheStrategy } from '../config/strategies/cache/cache-strategy.interface';
import { Logger } from '../logger/logger';
import { Cache, CacheConfigOptions } from './cache';

const ContextName = 'ConfigService';

@Injectable()
export class CacheService {
	private cacheStrategy: CacheStrategy;

	constructor(private readonly configService: ConfigService) {
		this.cacheStrategy = this.configService.system.cacheStrategy;
	}

	/**
	 * @description
	 * Creates a wrapper class around the `CacheService` methods
	 */
	public createCache(config: CacheConfigOptions): Cache {
		return new Cache(config, this);
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
}
