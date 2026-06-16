/**
 * @description
 * Returns a function that evaluates to true if the item is found in the items set
 * which is determined by the equality check on the given comparisonKey
 */
export function foundIn<T>(items: T[], comparisonKey: keyof T) {
	return (item: T): boolean => items.some((t) => t[comparisonKey] === item[comparisonKey]);
}
