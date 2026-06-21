import { describe, expect, it } from 'vitest';
import { filterUnique } from './filter-unique';

describe('filterUnique()', () => {
	it('filters unique primitives values', () => {
		expect(
			filterUnique([
				1,
				1,
				2,
				3,
				4,
				4,
				9,
			]),
		).toEqual([
			1,
			2,
			3,
			4,
			9,
		]);
		expect(
			filterUnique([
				1,
				1,
				null,
				null,
			]),
		).toEqual([
			1,
			null,
		]);
	});

	it('filters unique objects', () => {
		const userA = {
			name: 'john',
		};
		const userB = {
			name: 'doe',
		};

		expect(
			filterUnique([
				userA,
				userB,
				userA,
				userB,
			]),
		).toEqual([
			userA,
			userB,
		]);
	});

	it('filters unique objects with a key', () => {
		const userA = {
			name: 'john',
			id: 'userA',
		};
		const userB = {
			name: 'doe',
			id: 'userB',
		};
		const userC = {
			name: 'doe',
			id: 'userA',
		};

		// in this case userC has an id of the userA
		// so it's filtered out of the list since it eventually
		// resolves to userA when filtering by id
		expect(
			filterUnique(
				[
					userA,
					userB,
					userB,
					userC,
					userA,
				],
				'id',
			),
		).toEqual([
			userA,
			userB,
		]);
	});

	it('works on empty arrays', () => {
		expect(filterUnique([])).toEqual([]);
	});
});
