export function assertPromise<T>(promise: Promise<T | undefined | null>): Promise<T> {
	return promise as Promise<T>;
}
