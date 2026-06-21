export function getByPath(obj: unknown, path?: string): unknown {
	if (!path) return undefined;

	return path.split('.').reduce((current: any, key) => current?.[key], obj);
}
