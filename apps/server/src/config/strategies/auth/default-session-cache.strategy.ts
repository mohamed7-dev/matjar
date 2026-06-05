import { Injector } from '../../../common/helpers/injector';
import { JSONCompatible } from '../../../common/types/json-compatible';
import { SessionCacheEntry, SessionCacheStrategy } from './session-cache-strategy.interface';

interface DefaultSessionCacheStrategyOptions {
	ttl?: number;
	prefix?: string;
}

export class DefaultSessionCacheStrategy implements SessionCacheStrategy {
	private readonly tags = [
		'DefaultSessionCacheStrategy',
	];
	private cacheService: import('../../../cache/cache.service').CacheService;

	constructor(private options?: DefaultSessionCacheStrategyOptions) {}

	async onInit(injector: Injector): Promise<void> {
		const { CacheService } = await import('../../../cache/cache.service.js');
		this.cacheService = injector.get(CacheService);
	}

	public async set(serializedSession: SessionCacheEntry): Promise<void> {
		await this.cacheService.store(
			this.buildKey(serializedSession.token),
			this.prepareForStorage(serializedSession),
			{
				ttlInMs: this.options?.ttl ? this.options.ttl : 24 * 60 * 60 * 1000, // 1 day
				tags: this.tags,
			},
		);
	}

	public async get(sessionToken: string): Promise<SessionCacheEntry | undefined> {
		const cacheEntry = await this.cacheService.retrieve<JSONCompatible<SessionCacheEntry>>(
			this.buildKey(sessionToken),
		);
		return cacheEntry ? this.retrieveFromStorage(cacheEntry) : undefined;
	}

	public async delete(sessionToken: string): Promise<void> {
		return await this.cacheService.delete(this.buildKey(sessionToken));
	}

	public async clear(): Promise<void> {
		return await this.cacheService.purgeByTags(this.tags);
	}

	private prepareForStorage(sessionEntry: SessionCacheEntry): JSONCompatible<SessionCacheEntry> {
		return {
			...sessionEntry,
			expiresAt: sessionEntry.expiresAt.toISOString(),
		} as JSONCompatible<SessionCacheEntry>;
	}

	private retrieveFromStorage(sessionEntry: JSONCompatible<SessionCacheEntry>): SessionCacheEntry {
		return {
			...sessionEntry,
			expiresAt: new Date(sessionEntry.expiresAt),
		} as SessionCacheEntry;
	}

	private buildKey(token: string): string {
		return `${this.options?.prefix ?? 'session-cache'}:${token}`;
	}
}
