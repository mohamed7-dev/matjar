import { Logger } from '../../logger';

export interface SelfRefreshingCacheApi<Value, RefreshArgs extends Array<any> = []> {
	/**
	 * @description
	 * The current value of the cache, if it's stale, it will be refreshed and then returned
	 * @param args
	 */
	value(
		...args:
			| RefreshArgs
			| [
					undefined,
			  ]
			| []
	): Promise<Value>;

	/**
	 * @description
	 * Forces refreshing the data regardless of the ttl option, this is useful when
	 * it's known for sure that the data has changed and needs refreshing in the cache
	 */
	refresh(...args: RefreshArgs): Promise<Value>;
}

interface SelfRefreshingCacheConfigOptions<Value, RefreshArgs extends Array<any>> {
	name: string;
	ttlInMs: number;
	refresh: {
		fn(...args: RefreshArgs): Promise<Value>;
		/**
		 * @description
		 * Args which will be passed to the refresh fn
		 */
		defaultArgs: RefreshArgs;
	};

	/**
	 * @description
	 * Used for testing purposes.
	 * @default `() => Date.now()`
	 */
	getTimeFn?: () => number;
}
export async function createSelfRefreshingCache<Value, RefreshArgs extends Array<any>>(
	configOptions: SelfRefreshingCacheConfigOptions<Value, RefreshArgs>,
	refreshArgs?: RefreshArgs,
): Promise<SelfRefreshingCacheApi<Value, RefreshArgs>> {
	const { getTimeFn, ttlInMs, refresh, name } = configOptions;

	const getTimeNow = getTimeFn ?? ((): number => Date.now());
	let expires = getTimeNow() + ttlInMs;

	const initialValue: Value = await refresh.fn(...(refreshArgs ?? refresh.defaultArgs));
	let value = initialValue;

	const refreshValue = async (args: RefreshArgs): Promise<Value> => {
		return await refresh
			.fn(...args)
			.then((newValue) => {
				value = newValue;
				expires = getTimeNow() + ttlInMs;

				return value;
			})
			.catch((err: any) => {
				const _message = err.message;
				const message = typeof _message === 'string' ? _message : JSON.stringify(err.message);
				Logger.error(
					`Failed to update SelfRefreshingCache "${name}": ${message}`,
					undefined,
					err.stack,
				);
				return value;
			});
	};

	const getValue = async (args?: RefreshArgs): Promise<Value> => {
		const now = getTimeNow();
		if (expires < now) {
			return refreshValue(args ?? refresh.defaultArgs);
		}
		return value;
	};

	return {
		value: (...args): Promise<Value> =>
			getValue(
				!args.length || (args.length === 1 && args[0] === undefined)
					? undefined
					: (args as RefreshArgs),
			),

		refresh: (...args) => refreshValue(args),
	};
}
