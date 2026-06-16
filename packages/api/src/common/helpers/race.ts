export function race<T>(slowPromise: Promise<T> | T, timeoutDuration: number = 50): Promise<T | undefined> {
	return Promise.race([
		new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutDuration)),
		slowPromise,
	]);
}
