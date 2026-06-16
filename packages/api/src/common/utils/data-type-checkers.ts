export function isObject(input: unknown): input is object {
	return !!input && typeof input === 'object' && !Array.isArray(input);
}

export function isClassInstance(input: any): boolean {
	return isObject(input) && input.constructor && input.constructor.name !== 'Object';
}

export function isFileObject(input: any): boolean {
	if (typeof File === 'undefined') {
		return false;
	} else {
		return input instanceof File;
	}
}
