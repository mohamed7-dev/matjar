import { nanoid } from 'nanoid';

/**
 * @description
 * A simple utility that generates ids
 */
export function generateId(): string {
	return nanoid();
}
