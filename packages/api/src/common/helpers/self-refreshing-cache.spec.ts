import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createSelfRefreshingCache, SelfRefreshingCacheApi } from './self-refreshing-cache';

describe('createSelfRefreshingCache()', () => {
	// this function counts the length of the arg
	const fn = vi.fn().mockImplementation((arg: string) => arg.length);
	let currentTime = 0;
	let selfRefreshingCache: SelfRefreshingCacheApi<
		number,
		[
			string,
		]
	>;

	beforeAll(async () => {
		selfRefreshingCache = await createSelfRefreshingCache({
			name: 'Test',
			ttlInMs: 1000,
			refresh: {
				fn: async (...args) => {
					return fn(args[0]);
				},
				defaultArgs: [
					'test',
				],
			},
			getTimeFn: () => currentTime,
		});
	});

	afterEach(() => {
		fn.mockClear();
		currentTime = 0;
	});

	it('fetches data on first call', async () => {
		const result = await selfRefreshingCache.value();
		expect(result).toBe(4);
	});

	it('refreshes stale data when requested', async () => {
		currentTime = 1001;
		const result = await selfRefreshingCache.value();
		expect(result).toBe(4);
		// don't forget that we have another call on creating the cache
		// to get the initial value, so the fn is called 2 times
		expect(fn.mock.calls.length).toBe(1);
	});

	it('returns data from cache if not stale', async () => {
		const result = await selfRefreshingCache.value();
		expect(result).toBe(4);
		// don't forget that we have another call on creating the cache
		// to get the initial value, so the fn is called only once
		expect(fn.mock.calls.length).toBe(0);
	});

	it('refreshes forcefully when refresh function is called', async () => {
		const result = await selfRefreshingCache.refresh('new');
		expect(result).toBe(3);
		// don't forget that we have another call on creating the cache
		// to get the initial value, so the fn is called 2 times
		expect(fn.mock.calls.length).toBe(1);
	});
});
