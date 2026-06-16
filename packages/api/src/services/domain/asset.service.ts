import { ReadStream } from 'node:fs';
import {
	AssetListOptions,
	AssetType,
	AssignAssetsToMarketplaceInput,
	CreateAssetsInput,
	DeletionResponse,
	DeletionResult,
	Permission,
	UpdateAssetInput,
} from '@matjar/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import { imageSize } from 'image-size';
import mime from 'mime-types';
import { FindOptionsRelations } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { ForbiddenError, InternalServerError } from '../../common/errors/errors';
import { InvalidMimetypeError } from '../../common/errors/generated-graphql-admin-errors';
import { isGraphqlApiError } from '../../common/errors/graphql-api-error';
import { PaginatedList } from '../../common/types/paginated-list';
import { Translated } from '../../common/types/translatable';
import { filterUnique } from '../../common/utils/filter-unique';
import { notNullOrUndefined } from '../../common/utils/not-null-or-undefined';
import { omit } from '../../common/utils/omit';
import { ConfigService } from '../../config/config.service';
import { Asset } from '../../entities/asset/asset.entity';
import { AssetTranslation } from '../../entities/asset/asset-translation.entity';
import { EventBus } from '../../event-bus/event-bus';
import { AssetEvent } from '../../event-bus/events/asset-event';
import { AssetMarketplaceEvent } from '../../event-bus/events/asset-marketplace-event';
import { Logger } from '../../logger';
import { OrmService } from '../../orm/orm.service';
import { patchEntity } from '../../orm/utils/patch-entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver.service';
import { TranslatorService } from '../helpers/translator.service';
import { MarketplaceRegionService } from './marketplace-region.service';
import { RoleService } from './role.service';

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
		private readonly translatableSaver: TranslatableSaver,
		private readonly roleService: RoleService,
		private readonly listQueryBuilder: ListQueryBuilder,
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

	public async update(ctx: RequestContext, input: UpdateAssetInput): Promise<Translated<Asset>> {
		const asset = await this.ormService.getEntityOrThrow(ctx, Asset, input.id);
		// 1. handle focal point
		if (input.focalPoint) {
			const toFixed = (x: number): number => +x.toFixed(3);
			input.focalPoint.x = toFixed(input.focalPoint.x);
			input.focalPoint.y = toFixed(input.focalPoint.y);
		}

		// 2. patch entity excluding name and translations
		patchEntity(
			asset,
			omit(input, [
				'name',
				'translations',
			]),
		);

		// 3. handle tags

		// 4. handle translations and save updated asset
		if (input.translations && input.translations.length > 0) {
			await this.translatableSaver.update({
				ctx,
				entityType: Asset,
				translationEntityType: AssetTranslation,
				input: {
					id: asset.id,
					translations: input.translations,
				},
			});
		}

		const translatedAsset = await this.findOne(ctx, asset.id);
		if (!translatedAsset) {
			// entity should be there, so if it's not found for any reason, this should be considered
			// an internal error not an api error
			throw new InternalServerError('errors.entity_not_found');
		}
		await this.eventBus.publish(new AssetEvent(ctx, translatedAsset, 'updated', input));
		return translatedAsset;
	}

	public async delete(
		ctx: RequestContext,
		assetIds: string[],
		options: {
			force?: boolean;
			deleteFromAllMarketplaces?: boolean;
		} = {},
	): Promise<DeletionResponse> {
		// 1. find all assets by their ids
		const assets = await this.ormService.findByIdsInMarketplace(
			ctx,
			Asset,
			assetIds,
			ctx.marketplaceRegionId,
			{
				relations: {
					marketplaceRegions: true,
				},
			},
		);
		// 2. find marketplaces where these assets are assigned
		let marketplacesOfAssets = assets.flatMap((asset) => asset.marketplaceRegions.map((mpr) => mpr.id));
		marketplacesOfAssets = filterUnique(marketplacesOfAssets);

		// 3. calculate usage count of each asset to decide whether it's deletable or not
		const usageCount = {
			products: 0,
			variants: 0,
			collections: 0,
		};
		for (const asset of assets) {
			// TODO: find usages
		}
		const hasUsages = !!(usageCount.products || usageCount.variants || usageCount.collections);

		if (hasUsages && !options.force) {
			return {
				result: DeletionResult.NOT_DELETED,
				message: ctx.t('message.asset_to_be_deleted_is_featured', {
					assetCount: assets.length,
					products: usageCount.products,
					variants: usageCount.variants,
					collections: usageCount.collections,
				}),
			};
		}
		const hasDeleteAllPermission = await this.hasDeletePermissionForMarketplaces(
			ctx,
			marketplacesOfAssets,
		);
		if (options.deleteFromAllMarketplaces && !hasDeleteAllPermission) {
			throw new ForbiddenError();
		}

		if (!options.deleteFromAllMarketplaces) {
			// if deleteFromAllMarketplaces is not set or false, then assets will only be unassigned
			// from the current marketplace and deleted if they are assigned to a single marketplace
			await Promise.all(
				assets.map(async (asset) => {
					await this.marketplaceRegionService.UnAssignFromMarketplaceRegion(ctx, Asset, asset.id, [
						ctx.marketplaceRegionId,
					]);
					await this.eventBus.publish(
						new AssetMarketplaceEvent(ctx, asset, ctx.marketplaceRegionId, 'removed'),
					);
				}),
			);
			const isOnlyMarketplace = marketplacesOfAssets.length === 1;
			if (isOnlyMarketplace) {
				await this._delete(ctx, assets);
			}
			return {
				result: DeletionResult.DELETED,
			};
		}

		// reaching this block means that deleteFromAllMarketplaces is true and force is true as well
		await Promise.all(
			assets.map(async (asset) => {
				await this.marketplaceRegionService.UnAssignFromMarketplaceRegion(
					ctx,
					Asset,
					asset.id,
					marketplacesOfAssets,
				);
				await this.eventBus.publish(
					new AssetMarketplaceEvent(ctx, asset, ctx.marketplaceRegionId, 'removed'),
				);
			}),
		);
		return await this._delete(ctx, assets);
	}

	public async findOne(
		ctx: RequestContext,
		id: string,
		relations?: FindOptionsRelations<Asset>,
	): Promise<Translated<Asset> | undefined> {
		return await this.ormService
			.findOneInMarketplace(ctx, Asset, id, ctx.marketplaceRegionId, {
				relations,
			})
			.then((entity) => (entity ? this.translatorService.translate(ctx, entity) : undefined));
	}

	public async find(
		ctx: RequestContext,
		options?: AssetListOptions,
		relations?: FindOptionsRelations<Asset>,
	): Promise<PaginatedList<Translated<Asset>>> {
		// TODO: before calling getManyAndCount(), handle filtering by tags
		return await this.listQueryBuilder
			.build(Asset, options as any, {
				ctx,
				relations,
				marketplaceRegionId: ctx.marketplaceRegionId,
			})
			.getManyAndCount()
			.then(([items, totalItems]) => {
				return {
					items: items.map((asset) => this.translatorService.translate(ctx, asset)),
					totalItemsCount: totalItems,
				};
			});
	}

	public async assignToMarketplaceRegion(
		ctx: RequestContext,
		input: AssignAssetsToMarketplaceInput,
	): Promise<Array<Translated<Asset>>> {
		const assets = await this.ormService.findByIdsInMarketplace(
			ctx,
			Asset,
			input.assetIds,
			ctx.marketplaceRegionId,
			{},
		);
		await Promise.all(
			assets.map(async (asset) => {
				await this.marketplaceRegionService.assignToMarketplaceRegions(ctx, Asset, asset.id, [
					input.marketplaceId,
				]);
				return await this.eventBus.publish(
					new AssetMarketplaceEvent(ctx, asset, input.marketplaceId, 'assigned'),
				);
			}),
		);
		const updatedAssets = await this.ormService.findByIdsInMarketplace(
			ctx,
			Asset,
			assets.map((a) => a.id),
			ctx.marketplaceRegionId,
			{},
		);
		return updatedAssets.map((asset) => this.translatorService.translate(ctx, asset));
	}

	private async _delete(ctx: RequestContext, assets: Asset[]): Promise<DeletionResponse> {
		for (const asset of assets) {
			// using remove method sets the id to undefined so we have to create a new asset
			// to keep a reference to the id
			const deletedAsset = new Asset(asset);
			await this.ormService.getRepository(ctx, Asset).remove(asset);

			try {
				const { assetStorageStrategy } = this.configService.asset;
				await assetStorageStrategy.deleteFile(asset.sourceIdentifier);
				await assetStorageStrategy.deleteFile(asset.previewIdentifier);
			} catch (e: any) {
				Logger.error('Could not delete the asset file', undefined, e.stack);
			}
			await this.eventBus.publish(new AssetEvent(ctx, deletedAsset, 'deleted', deletedAsset.id));
		}
		return {
			result: DeletionResult.DELETED,
		};
	}

	private async hasDeletePermissionForMarketplaces(
		ctx: RequestContext,
		marketplaceIds: string[],
	): Promise<boolean> {
		const permissions = await Promise.all(
			marketplaceIds.map(async (marketplaceId) => {
				return this.roleService.userHasPermissionOnMarketplace(
					ctx,
					marketplaceId,
					Permission.platform_catalog_delete,
				);
			}),
		);
		return !permissions.includes(false);
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

		// 7. assign to active marketplace region
		await this.marketplaceRegionService.assignToActiveMarketplaceRegion(ctx, asset);
		const savedAsset = await this.ormService.getRepository(ctx, Asset).save(asset);

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
