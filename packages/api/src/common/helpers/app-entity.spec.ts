import { describe, expect, it } from 'vitest';
import { DeepPartial } from '../types/deep-partial';
import { AppEntity } from './app-entity';

class Asset extends AppEntity {
	constructor(input?: DeepPartial<Asset>) {
		super(input);
	}

	name: string;

	get nameLoud(): string {
		return this.name.toUpperCase();
	}
}

describe('AppEntity', () => {
	it('instantiates asset entity', () => {
		const asset = new Asset({
			name: 'foo',
		});

		expect(asset.name).toBe('foo');
		expect(asset.nameLoud).toBe('FOO');
	});

	it('instantiates a new asset from an existing asset entity', () => {
		const asset1 = new Asset({
			name: 'foo',
		});
		const asset2 = new Asset(asset1);

		expect(asset2.name).toBe('foo');
		expect(asset2.nameLoud).toBe('FOO');
	});
});
