import { JSONCompatible } from '../../../common/types/json-compatible';
import { CacheEntryOptions, CacheStrategy } from './cache-strategy.interface';

interface CacheEntry<Value> {
	value: Value;
	ttl: number | undefined;
	tags: Set<string>;
}

interface InMemoryCacheOptions {
	cacheSize?: number;
}

export class InMemoryCacheStrategy implements CacheStrategy {
	private cacheSize: number;
	constructor(options?: InMemoryCacheOptions) {
		this.cacheSize = options?.cacheSize ?? 10_000;
	}

	private readonly cacheStore = new Map<string, CacheEntry<any>>();

	public store<Value extends JSONCompatible<Value>>(
		key: string,
		value: Value,
		options?: CacheEntryOptions,
	): void | Promise<void> {
		const cacheHit = this.cacheStore.get(key);
		if (cacheHit) {
			// delete this entry and add it to the end of the list
			this.cacheStore.delete(key);
		} else {
			if (this.cacheStore.size >= this.cacheSize) {
				const key = this.getOldestEntryKey();
				// evict oldest entry
				if (key) this.cacheStore.delete(key);
			}
		}
		this.cacheStore.set(key, {
			value,
			ttl: options?.ttlInMs ? Date.now() + options.ttlInMs : undefined,
			tags: new Set(options?.tags ?? []),
		});
	}

	public retrieve<Value extends JSONCompatible<Value>>(
		key: string,
	): undefined | Value | Promise<undefined | Value> {
		const cacheHit = this.cacheStore.get(key) as CacheEntry<Value> | undefined;
		if (cacheHit) {
			const isStale = cacheHit.ttl !== undefined && Date.now() > cacheHit.ttl;
			if (isStale) {
				this.cacheStore.delete(key);
			} else {
				return cacheHit.value;
			}
		}

		return undefined;
	}
	public delete(key: string): void | Promise<void> {
		this.cacheStore.delete(key);
	}

	public purgeByTags(tags: string[]): void | Promise<void> {
		tags.forEach((tag) => {
			this.cacheStore.forEach((cacheStoreItem, cacheStoreKey) => {
				if (cacheStoreItem.tags?.has(tag)) {
					this.cacheStore.delete(cacheStoreKey);
				}
			});
		});
	}

	private getOldestEntryKey(): string | undefined {
		return this.cacheStore.keys().next().value;
	}
}
