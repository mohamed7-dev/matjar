import { LanguageCode } from '@matjar/common/lib/generated-types';
import { beforeEach, describe, expect, it } from 'vitest';
import { TranslationInput } from '../../../common/types/translatable';
import { Asset } from '../../../entities/asset/asset.entity';
import { AssetTranslation } from '../../../entities/asset/asset-translation.entity';
import { TranslationDiffer } from './translation-differ';

describe('TranslationDiffer', () => {
	const existing: AssetTranslation[] = [
		new AssetTranslation({
			id: '1',
			languageCode: LanguageCode.en,
			name: 't-shirt',
		}),
		new AssetTranslation({
			id: '2',
			languageCode: LanguageCode.ar,
			name: 'قميص',
		}),
	];

	let ormService: any;

	beforeEach(() => {
		ormService = {};
	});

	it('Correctly Marks translations for update', () => {
		const input: Array<TranslationInput<Asset>> = [
			{
				languageCode: LanguageCode.en,
				name: 't-shirt-updated',
			},
		];
		const translationDiffer = new TranslationDiffer(AssetTranslation as any, ormService);
		const diff = translationDiffer.diff(existing, input);
		expect(diff.toUpdate.find((tr) => tr.languageCode === LanguageCode.ar)).toEqual(undefined);
		expect(
			(diff.toUpdate.find((tr) => tr.languageCode === LanguageCode.en) as AssetTranslation)?.name,
		).toEqual('t-shirt-updated');
	});

	it('Correctly Marks translations for addition', () => {
		const input: Array<TranslationInput<Asset>> = [
			{
				languageCode: LanguageCode.tr,
				name: 'gomlek',
			},
		];
		const translationDiffer = new TranslationDiffer(AssetTranslation as any, ormService);
		const diff = translationDiffer.diff(existing, input);
		expect(diff.toAdd).toEqual(input);
	});

	it('Correctly Marks translations for both update and addition', () => {
		const input: Array<TranslationInput<Asset>> = [
			{
				languageCode: LanguageCode.tr,
				name: 'gomlek',
			},
			{
				languageCode: LanguageCode.en,
				name: 't-shirt-updated',
			},
		];
		const translationDiffer = new TranslationDiffer(AssetTranslation as any, ormService);
		const diff = translationDiffer.diff(existing, input);
		expect(diff.toAdd).toEqual([
			input[0],
		]);
		expect((diff.toUpdate[0] as AssetTranslation).name).toEqual('t-shirt-updated');
	});
});
