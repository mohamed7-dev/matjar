export function notNullOrUndefined<T>(input: T | undefined | null): input is T {
	return input !== undefined && input !== null;
}
