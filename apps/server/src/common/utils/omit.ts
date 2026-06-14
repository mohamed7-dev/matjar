import { isFileObject, isObject } from './data-type-checkers';

export function omit<T extends object, K extends keyof T>(obj: T, keysToOmit: K[]): Omit<T, K>;
export function omit<T extends object | any[]>(obj: T, keysToOmit: string[], recursive: boolean): T;
export function omit<T, K extends keyof T>(obj: T, keysToOmit: string[], recursive: boolean = false): T {
	if ((recursive && !isObject(obj)) || isFileObject(obj)) {
		return obj;
	}

	if (recursive && Array.isArray(obj)) {
		return obj.map((item: any) => omit(item, keysToOmit, true)) as T;
	}

	return Object.keys(obj as object).reduce(
		(output: any, key) => {
			if (keysToOmit.includes(key)) {
				return output;
			}
			if (recursive) {
				return {
					...output,
					[key]: omit((obj as any)[key], keysToOmit, true),
				};
			}
			return {
				...output,
				[key]: (obj as any)[key],
			};
		},
		{} as Omit<T, K>,
	);
}
