/**
 * @description
 * A simple utility that converts an input which starts with camel case letter into upper snake case
 *
 */
export function camelToUpperSnakeCase(input: string): string {
	return input.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}