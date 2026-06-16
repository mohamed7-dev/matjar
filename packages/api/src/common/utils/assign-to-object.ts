export function assignToObject(target: object, key: string, value: any): void {
	if (
		[
			'__proto__',
			'prototype',
			'constructor',
		].includes(key)
	) {
		return;
	}

	Object.defineProperty(target, key, {
		value,
		writable: true,
		enumerable: true,
		configurable: true,
	});
}
