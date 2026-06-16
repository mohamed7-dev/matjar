type JSONValue =
	| string
	| number
	| boolean
	| null
	| Array<JSONValue>
	| {
			[key: string]: JSONValue;
	  };

export type JSONCompatible<T> = {
	[Key in keyof T]: T[Key] extends JSONValue
		? T[Key]
		: Pick<T, Key> extends Required<Pick<T, Key>>
			? never
			: JSONCompatible<T[Key]>;
};
