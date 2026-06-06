import { ReadStream } from 'node:fs';
import { AssetType, CreateAssetsInput } from '@matjar/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import { imageSize } from 'image-size';
import mime from 'mime-types';
import { RequestContext } from '../../api/request-context/request-context';
import { InvalidMimetypeError } from '../../common/errors/generated-graphql-admin-errors';
import { isGraphqlApiError } from '../../common/errors/graphql-api-error';
import { Translated } from '../../common/types/translatable';
import { notNullOrUndefined } from '../../common/utils/not-null-or-undefined';
import { ConfigService } from '../../config/config.service';
import { Asset } from '../../entities/asset/asset.entity';
import { AssetTranslation } from '../../entities/asset/asset-translation.entity';
import { EventBus } from '../../event-bus/event-bus';
import { AssetEvent } from '../../event-bus/events/asset-event';
import { Logger } from '../../logger';
import { OrmService } from '../../orm/orm.service';
import { TranslatorService } from '../helpers/translator.service';
import { MarketplaceRegionService } from './marketplace-region.service';

@Injectable()
export class AssetService {
	private allowedMimeTypes: {
		type: string;
		subtype: string;
	}[];

	constructor(
		private readonly configService: ConfigService,
		private readonly ormService: OrmService,
		private readonly translatorService: TranslatorService,
		private readonly marketplaceRegionService: MarketplaceRegionService,
		private readonly eventBus: EventBus,
	) {
		this.normalizeFileTypes();
	}

	public async create(
		ctx: RequestContext,
		input: CreateAssetsInput,
	): Promise<Translated<Asset> | InvalidMimetypeError> {
		const { mimetype, filename, createReadStream } = await input.file;
		const { stream, errorPromise } = this.guardStream(createReadStream);
		const result = await Promise.race([
			this._create(
				ctx,
				stream,
				{
					filename,
					mimetype,
				},
				input.translations,
			),
			errorPromise,
		]);
		if (isGraphqlApiError(result)) return result;
		await this.eventBus.publish(new AssetEvent(ctx, result, 'created', input));
		const translatedAsset = this.translatorService.translate(ctx, result);
		return translatedAsset;
	}

	private async _create(
		ctx: RequestContext,
		stream: ReadStream,
		fileInfo: {
			filename: string;
			mimetype: string;
		},
		translations?: CreateAssetsInput['translations'],
	): Promise<Asset | InvalidMimetypeError> {
		// 1. validate mimetype
		const isValidMimetype = this.validateMimetype(fileInfo.mimetype);
		if (!isValidMimetype) {
			return new InvalidMimetypeError({
				mimeType: fileInfo.mimetype,
				fileName: fileInfo.filename,
			});
		}

		// 2.  get source/preview filenames
		const sourceFileName = await this.getSourceFileName(ctx, fileInfo.filename);
		const previewFileName = await this.getPreviewFileName(ctx, sourceFileName);

		// 3. upload asset, and its preview, and get source, and preview identifiers
		const { assetStorageStrategy, assetPreviewStrategy } = this.configService.asset;
		const sourceFileIdentifier = await assetStorageStrategy.saveFileFromStream(stream, {
			filename: sourceFileName,
			mimetype: fileInfo.mimetype,
		});
		const sourceFile = await assetStorageStrategy.readFileToBuffer(sourceFileIdentifier);

		let previewFile: Buffer;
		try {
			previewFile = await assetPreviewStrategy.generatePreviewImage(ctx, fileInfo.mimetype, sourceFile);
		} catch (e: any) {
			const message: string = typeof e.message === 'string' ? e.message : e.message.toString();
			Logger.error(`Could not create Asset preview image: ${message}`, undefined, e.stack);
			throw e;
		}
		const previewFileIdentifier = await assetStorageStrategy.saveFileFromBuffer(previewFile, {
			filename: previewFileName,
			mimetype: fileInfo.mimetype,
		});

		// 4. resolve AssetType from mimetype
		const assetType = this.getAssetType(fileInfo.mimetype);

		// 5. calculate asset dimensions
		const dimensions = this.calculateDimensions(assetType === AssetType.IMAGE ? sourceFile : previewFile);

		// 6. save asset
		const asset = new Asset({
			type: assetType,
			width: dimensions.width,
			height: dimensions.height,
			fileSize: sourceFile.byteLength,
			mimetype: fileInfo.mimetype,
			sourceIdentifier: sourceFileIdentifier,
			previewIdentifier: previewFileIdentifier,
		});
		const savedAsset = await this.ormService.getRepository(ctx, Asset).save(asset);

		// 7. assign to active marketplace region
		await this.marketplaceRegionService.assignToActiveMarketplaceRegion(ctx, savedAsset);

		// 8. save translations
		const defaultName = fileInfo.filename;
		let assetTranslations: AssetTranslation[];
		if (translations?.length) {
			assetTranslations = translations.map(
				(t) =>
					new AssetTranslation({
						languageCode: t.languageCode,
						name: t.name ?? defaultName,
						base: savedAsset,
					}),
			);
		} else {
			// Create default translation using context language
			assetTranslations = [
				new AssetTranslation({
					languageCode: ctx.languageCode,
					name: defaultName,
					base: savedAsset,
				}),
			];
		}

		const savedTranslations = await this.ormService
			.getRepository(ctx, AssetTranslation)
			.save(assetTranslations);
		savedAsset.translations = savedTranslations;
		return savedAsset;
	}

	private calculateDimensions(imageFile: Buffer): {
		width: number;
		height: number;
	} {
		try {
			const { width, height } = imageSize(imageFile as Uint8Array<ArrayBufferLike>);
			return {
				width: width ?? 0,
				height: height ?? 0,
			};
		} catch (e: any) {
			Logger.error(`Could not determine Asset dimensions: ${JSON.stringify(e)}`);
			return {
				width: 0,
				height: 0,
			};
		}
	}

	private getAssetType(mimetype: string): AssetType {
		const type = mimetype.split('/')[0];

		switch (type) {
			case 'image':
				return AssetType.IMAGE;
			case 'video':
				return AssetType.VIDEO;
			default:
				return AssetType.BINARY;
		}
	}

	private async getSourceFileName(ctx: RequestContext, filename: string): Promise<string> {
		let outputFileName: string | undefined;

		do {
			outputFileName = this.configService.asset.assetNamingStrategy.createSourceName(
				ctx,
				filename,
				outputFileName,
			);
		} while (await this.configService.asset.assetStorageStrategy.fileExists(outputFileName));

		return outputFileName;
	}

	private async getPreviewFileName(ctx: RequestContext, filename: string): Promise<string> {
		let outputFileName: string | undefined;

		do {
			outputFileName = this.configService.asset.assetNamingStrategy.createPreviewName(
				ctx,
				filename,
				outputFileName,
			);
		} while (await this.configService.asset.assetStorageStrategy.fileExists(outputFileName));

		return outputFileName;
	}

	private validateMimetype(mimetype: string): boolean {
		const [type, subtype] = mimetype.split('/');
		const typeMatches = this.allowedMimeTypes.filter((t) => t.type === type);

		for (const typeMatch of typeMatches) {
			if (typeMatch.subtype === subtype || typeMatch.subtype === '*') {
				return true;
			}
		}

		return false;
	}

	private normalizeFileTypes(): void {
		const extensionRegex = /\.[\w]+/;

		const mimeTypes = this.configService.asset.allowedFileTypes
			.map((fileType) => {
				return extensionRegex.test(fileType) ? mime.lookup(fileType) || undefined : fileType;
			})
			.filter(notNullOrUndefined)
			.map((mimetype) => {
				const [type, subtype] = mimetype.split('/');
				return {
					type,
					subtype,
				};
			});

		this.allowedMimeTypes = mimeTypes;
	}
	/**
	 * @description
	 * Prevents unhandled stream errors from crashing the process by creating a race between
	 * the normal asset creation workflow, and the error promise so the request fails immediately
	 * instead of hanging
	 */
	private guardStream(createReadStream: () => ReadStream): {
		errorPromise: Promise<never>;
		stream: ReadStream;
	} {
		let handleStreamErrors: (err: unknown) => void;

		const errorPromise = new Promise<never>((_, rej) => {
			handleStreamErrors = rej;
		});

		const stream = createReadStream();

		stream.on('error', (err: any) => {
			handleStreamErrors(err);
		});

		return {
			errorPromise,
			stream,
		};
	}
}
