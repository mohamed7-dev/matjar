import { JSONCompatible } from '../../../common/types/json-compatible';

export interface CacheEntryOptions {
	ttlInMs?: number;
	tags?: string[];
}

export interface CacheStrategy {
	store<Value extends JSONCompatible<Value>>(
		key: string,
		value: Value,
		options?: CacheEntryOptions,
	): void | Promise<void>;
	retrieve<Value extends JSONCompatible<Value>>(
		key: string,
	): undefined | Value | Promise<undefined | Value>;
	delete(key: string): void | Promise<void>;
	purgeByTags(tags: string[]): void | Promise<void>;
}
