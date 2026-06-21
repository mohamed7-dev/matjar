import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { omit } from './omit';

describe('omit()', () => {
	let isFileClassPatched = false;
	beforeAll(() => {
		if (typeof File === 'undefined') {
			(global as any).File = class MockFile {};
			isFileClassPatched = true;
		}
	});

	afterAll(() => {
		if (isFileClassPatched) {
			delete (global as any).File;
		}
	});

	it('omits props from single-level-deep objects', () => {
		const user = {
			name: 'john',
			age: 30,
		};

		expect(
			omit(user, [
				'age',
			]),
		).toEqual({
			name: 'john',
		});

		expect(
			omit(user, [
				'age',
				'name',
			]),
		).toEqual({});
	});

	it('omits props if they are nested objects', () => {
		const user = {
			name: 'john',
			age: 30,
			address: {
				city: 'NYC',
			},
		};

		const expected = {
			name: 'john',
			age: 30,
		};

		expect(
			omit(user, [
				'address',
			]),
		).toEqual(expected);
	});

	describe('when recursive is true', () => {
		it('omits props from single-level-deep objects', () => {
			const user = {
				name: 'john',
				age: 30,
			};

			const expected = {
				name: 'john',
			};

			expect(
				omit(
					user,
					[
						'age',
					],
					true,
				),
			).toEqual(expected);
		});

		it('omits props from two-levels-deep objects', () => {
			const user = {
				name: 'john',
				age: 30,
				address: {
					city: 'NYC',
					street: 'st',
				},
			};

			const expected = {
				name: 'john',
				age: 30,
				address: {
					street: 'st',
				},
			};

			expect(
				omit(
					user,
					[
						'city',
					],
					true,
				),
			).toEqual(expected);
		});

		it('omits props from two-levels-deep array objects', () => {
			const user = {
				name: 'john',
				age: 30,
				addresses: [
					{
						city: 'NYC',
						street: 'st.nyc',
					},
					{
						city: 'LA',
						street: 'st.la',
					},
				],
			};

			const expected = {
				name: 'john',
				age: 30,
				addresses: [
					{
						street: 'st.nyc',
					},
					{
						street: 'st.la',
					},
				],
			};
			expect(
				omit(
					user,
					[
						'city',
					],
					true,
				),
			).toEqual(expected);
		});

		it('omits props from array input', () => {
			const input = [
				{
					name: 'john',
				},
				{
					name: 'doe',
				},
				{
					name: 'alice',
					age: 20,
				},
			];
			const expected = [
				{
					name: 'john',
				},
				{
					name: 'doe',
				},
				{
					name: 'alice',
				},
			];

			expect(
				omit(
					input,
					[
						'age',
					],
					true,
				),
			).toEqual(expected);
		});
	});

	it('does not mutate file objects', () => {
		const file = new File([], 't-shirt');

		const input = {
			name: 't-shirt',
			image: file,
			price: 200,
		};

		const expected = {
			name: 't-shirt',
			image: file,
		};

		expect(
			omit(
				input,
				[
					'price',
				],
				true,
			),
		).toEqual(expected);
	});

	it('does not mutate input, it returns a new object', () => {
		const user = {
			name: 'john',
			age: 30,
		};

		expect(
			omit(user, [
				'age',
			]),
		).not.toBe(user);
	});
});
