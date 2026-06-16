/**
 * @description
 * Normalizes a user input string for consistent comparison and storage.
 *
 * If the input looks like an email address, it is trimmed and converted to lowercase.
 * Otherwise, it is only trimmed.
 *
 * ::: info
 * Email addresses are technically case-sensitive in the local part,
 * but in practice they are treated as case-insensitive in most systems.
 * :::
 */
export function normalizeInput(input: string): string {
	return isEmailAddressLike(input) ? input.trim().toLowerCase() : input.trim();
}

/**
 * @description
 * Checks if a string looks like an email address.
 *
 * This is a simple validation used to decide whether email normalization
 * (e.g. lowercasing) should be applied.
 *
 * Includes a length limit to prevent performance issues from very large inputs.
 */
export function isEmailAddressLike(input: string): boolean {
	if (input.length > 1000) {
		// This limit is in place to prevent abuse via a polynomial-time regex attack
		// See https://github.com/vendurehq/vendure/security/code-scanning/43
		throw new Error('Input too long');
	}
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
