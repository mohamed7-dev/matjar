import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryCacheStrategy } from './in-memory-cache.strategy';

describe('InMemoryCacheStrategy', () => {
	let cacheStrategy: InMemoryCacheStrategy;

	beforeEach(() => {
		cacheStrategy = new InMemoryCacheStrategy();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('Stores value in cache storage', () => {
		cacheStrategy.store('key1', {
			data: 'value1',
		});
		const result = cacheStrategy.retrieve('key1');

		expect(result).toEqual({
			data: 'value1',
		});
	});

	it('Retrieves value from cache storage', () => {
		cacheStrategy.store('myKey', 'myValue');
		cacheStrategy.store('key2', 123);
		cacheStrategy.store(
			'key3',
			[
				1,
				2,
				3,
			],
		);

		expect(cacheStrategy.retrieve('myKey')).toBe('myValue');
		expect(cacheStrategy.retrieve('key2')).toBe(123);
		expect(cacheStrategy.retrieve('key3')).toEqual([
			1,
			2,
			3,
		]);
	});

	it('Fails to retrieve value from cache storage if stale', () => {
		vi.useFakeTimers();

		cacheStrategy.store('expiredKey', 'value', {
			ttlInMs: 1000,
		});

		// Within TTL, should retrieve
		expect(cacheStrategy.retrieve('expiredKey')).toBe('value');

		// Fast forward time by 1001ms to exceed TTL
		vi.advanceTimersByTime(1001);

		// After TTL, should return undefined
		expect(cacheStrategy.retrieve('expiredKey')).toBeUndefined();

		vi.useRealTimers();
	});

	it('Removes from cache storage', () => {
		cacheStrategy.store('key1', 'value1');
		cacheStrategy.store('key2', 'value2');

		expect(cacheStrategy.retrieve('key1')).toBe('value1');
		expect(cacheStrategy.retrieve('key2')).toBe('value2');

		cacheStrategy.delete('key1');

		expect(cacheStrategy.retrieve('key1')).toBeUndefined();
		expect(cacheStrategy.retrieve('key2')).toBe('value2');
	});

	it('Purges cache storage by tags', () => {
		cacheStrategy.store('user:1', 'user1Data', {
			tags: [
				'user',
				'important',
			],
		});
		cacheStrategy.store('user:2', 'user2Data', {
			tags: [
				'user',
			],
		});
		cacheStrategy.store('post:1', 'post1Data', {
			tags: [
				'post',
				'important',
			],
		});

		// Verify all are stored
		expect(cacheStrategy.retrieve('user:1')).toBe('user1Data');
		expect(cacheStrategy.retrieve('user:2')).toBe('user2Data');
		expect(cacheStrategy.retrieve('post:1')).toBe('post1Data');

		// Purge by 'user' tag
		cacheStrategy.purgeByTags([
			'user',
		]);

		// User entries should be gone
		expect(cacheStrategy.retrieve('user:1')).toBeUndefined();
		expect(cacheStrategy.retrieve('user:2')).toBeUndefined();
		// Post should remain
		expect(cacheStrategy.retrieve('post:1')).toBe('post1Data');
	});

	it('Purges cache storage by multiple tags', () => {
		cacheStrategy.store('key1', 'value1', {
			tags: [
				'tag1',
				'tag2',
			],
		});
		cacheStrategy.store('key2', 'value2', {
			tags: [
				'tag2',
				'tag3',
			],
		});
		cacheStrategy.store('key3', 'value3', {
			tags: [
				'tag4',
			],
		});

		cacheStrategy.purgeByTags([
			'tag1',
			'tag3',
		]);

		expect(cacheStrategy.retrieve('key1')).toBeUndefined();
		expect(cacheStrategy.retrieve('key2')).toBeUndefined();
		expect(cacheStrategy.retrieve('key3')).toBe('value3');
	});

	it('Enforces cache size limit with LRU eviction', () => {
		const smallCache = new InMemoryCacheStrategy({
			cacheSize: 3,
		});

		smallCache.store('key1', 'value1');
		smallCache.store('key2', 'value2');
		smallCache.store('key3', 'value3');

		expect(smallCache.retrieve('key1')).toBe('value1');
		expect(smallCache.retrieve('key2')).toBe('value2');
		expect(smallCache.retrieve('key3')).toBe('value3');

		// Adding a 4th entry should evict the oldest (key1)
		smallCache.store('key4', 'value4');

		expect(smallCache.retrieve('key1')).toBeUndefined();
		expect(smallCache.retrieve('key2')).toBe('value2');
		expect(smallCache.retrieve('key3')).toBe('value3');
		expect(smallCache.retrieve('key4')).toBe('value4');
	});

	it('Updates existing entry and does not evict on re-store', () => {
		const smallCache = new InMemoryCacheStrategy({
			cacheSize: 2,
		});

		smallCache.store('key1', 'value1');
		smallCache.store('key2', 'value2');

		// Re-store key1 (should move it to end)
		smallCache.store('key1', 'updated');

		// Add key3, should evict key2 (oldest)
		smallCache.store('key3', 'value3');

		expect(smallCache.retrieve('key1')).toBe('updated');
		expect(smallCache.retrieve('key2')).toBeUndefined();
		expect(smallCache.retrieve('key3')).toBe('value3');
	});

	it('Returns undefined for non-existent key', () => {
		expect(cacheStrategy.retrieve('nonExistent')).toBeUndefined();
	});
});
