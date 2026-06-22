import { JSONCompatible } from '../common/types/json-compatible';
import { CacheEntryOptions } from '../config/strategies/cache/cache-strategy.interface';
import { CacheService } from './cache.service';

export interface CacheConfigOptions {
	generateKey: (identifier: string | number) => string;
	entryOptions?: CacheEntryOptions;
}

export class Cache {
	constructor(
		private configOptions: CacheConfigOptions,
		private cacheService: CacheService,
	) {}

	public async getOrInsert<Value extends JSONCompatible<Value>>(
		identifier: string,
		fn: () => Value | Promise<Value>,
	): Promise<Value> {
		const generatedKey = this.configOptions.generateKey(identifier);
		const hit = await this.cacheService.retrieve<Value>(generatedKey);
		if (hit !== undefined) return hit;
		const value = await fn();
		await this.cacheService.store(generatedKey, value, this.configOptions.entryOptions);
		return value;
	}

	public async removeBulk(idOrIds: string | number | Array<string | number>): Promise<void> {
		const ids = Array.isArray(idOrIds)
			? idOrIds
			: [
					idOrIds,
				];
		const keys = ids.map((id) => {
			return this.configOptions.generateKey(id);
		});
		await Promise.all(keys.map((key) => this.cacheService.delete(key)));
	}

	public async purgeByTags(tags: string[]): Promise<void> {
		await this.cacheService.purgeByTags(tags);
	}
}
