import { Trans } from '@lingui/react/macro';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@matjar/design-system/components/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { UploadIcon } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/infra/graphql/api.js';
import { FILE_DIALOG_OPEN_EVENT_TYPE } from '@/lib/keys.js';
import type { AssetsDisplayModeUnion } from '@/models/assets.schema.js';
import {
	type AssetFragment,
	assetsQueryDocument,
	createAssetsMutationDocument,
} from '@/services/asset.document.js';
import { type AssetBulkAction, AssetBulkActions } from '../asset/asset-bulk-actions.js';
import { ActionsBar, AssetType, type AssetTypeUnion } from './actions-bar.js';
import { AssetGridView } from './asset-grid/asset-grid-view.js';
import { AssetListView } from './asset-list/asset-list-view.js';
import { AssetsPagination } from './assets-pagination.js';

export type Asset = AssetFragment;

interface AssetGalleryProps {
	multiSelect?: 'manual' | 'auto';
	pageSize?: number;
	displayBulkActions?: boolean;
	bulkActions?: AssetBulkAction[];
	onPageSizeChange?: (pageSize: number) => void;
	displayMode?: AssetsDisplayModeUnion;
	onDisplayModeChange?: (displayMode: AssetsDisplayModeUnion) => void;
	onSelectAsset?: (assets: Asset[]) => void;
}

export function AssetGallery({
	multiSelect = undefined,
	onDisplayModeChange,
	displayMode = 'grid',
	pageSize = 24,
	onPageSizeChange,
	onSelectAsset,
	displayBulkActions = true,
	bulkActions,
}: AssetGalleryProps) {
	const qClient = useQueryClient();
	const [searchInput, setSearchInput] = React.useState('');
	const debouncedSearch = useDebounce(searchInput, 500);
	const [selectedAssets, setSelectedAssets] = React.useState<Asset[]>([]);
	const [assetType, setAssetType] = React.useState<AssetTypeUnion>(AssetType.ALL);
	const [page, setPage] = React.useState(1);
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

	const queryKey = [
		'asset-gallery',
		assetType,
		debouncedSearch,
		page,
		pageSize,
		selectedTags,
	];

	const {
		data,
		isLoading: isLoadingAssets,
		refetch,
	} = useQuery({
		queryKey,
		queryFn: () => {
			const filter: Record<string, any> = {};

			if (debouncedSearch) {
				filter.name = {
					contains: debouncedSearch,
				};
			}

			if (assetType !== AssetType.ALL) {
				filter.type = {
					equals: assetType,
				};
			}

			const options: any = {
				skip: (page - 1) * pageSize,
				take: pageSize,
				filter: Object.keys(filter).length > 0 ? filter : undefined,
				sort: {
					createdAt: 'DESC',
				},
			};

			if (selectedTags && selectedTags.length > 0) {
				options.tags = selectedTags;
				options.tagsOperator = 'AND';
			}

			return api.query(assetsQueryDocument, {
				options,
			});
		},
	});

	const assets = (data?.assets.items ?? []) as Asset[];
	const totalItemsCount = data?.assets.totalItemsCount || 0;
	const totalPagesCount = Math.ceil(totalItemsCount / pageSize);

	const { mutate: createAssets } = useMutation({
		mutationFn: api.mutate(createAssetsMutationDocument),
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey,
			});
		},
	});

	// Setup dropzone
	const onDrop = React.useCallback(
		(acceptedFiles: File[]) => {
			createAssets({
				input: acceptedFiles.map((file) => ({
					file,
				})),
			});
		},
		[
			createAssets,
		],
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		noClick: true,
	});

	const openFileDialog = React.useCallback(() => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true;
		fileInput.addEventListener('change', (event) => {
			const target = event.target as HTMLInputElement;
			if (target.files) {
				const filesList = Array.from(target.files);
				onDrop(filesList);
			}
		});
		fileInput.click();
	}, [
		onDrop,
	]);

	// Selection

	const isAssetSelected = (asset: Asset) => selectedAssets.some((a) => a.id === asset.id);

	const toggleAssetSelection = React.useCallback(
		(asset: Asset) => {
			const isCurrentlySelected = selectedAssets.some((a) => a.id === asset.id);
			const newSelected = isCurrentlySelected
				? selectedAssets.filter((a) => a.id !== asset.id)
				: [
						...selectedAssets,
						asset,
					];
			setSelectedAssets(newSelected);
			onSelectAsset?.(newSelected);
		},
		[
			selectedAssets,
			onSelectAsset,
		],
	);

	const handleSelect = (asset: Asset, event: React.MouseEvent | React.KeyboardEvent) => {
		if (multiSelect === 'auto') {
			toggleAssetSelection(asset);
			return;
		}

		// Manual mode - check for modifier key
		const isModifierKeyPressed = event.metaKey || event.ctrlKey;

		if (multiSelect === 'manual' && isModifierKeyPressed) {
			toggleAssetSelection(asset);
		} else {
			// No modifier key - single select
			setSelectedAssets([
				asset,
			]);
			onSelectAsset?.([
				asset,
			]);
		}
	};

	// Pagination
	const goToPage = (newPage: number) => {
		if (newPage < 1 || newPage > totalPagesCount) return;
		setPage(newPage);
	};

	React.useEffect(() => {
		const handleEvent = () => {
			openFileDialog();
		};

		document.addEventListener(FILE_DIALOG_OPEN_EVENT_TYPE, handleEvent);

		return () => {
			document.removeEventListener(FILE_DIALOG_OPEN_EVENT_TYPE, handleEvent);
		};
	}, [
		openFileDialog,
	]);

	return (
		<div className='flex flex-col gap-4'>
			<ActionsBar
				searchInput={searchInput}
				onSearchInputChange={(value) => setSearchInput(value)}
				assetType={assetType}
				onAssetTypeChange={(value) => setAssetType(value)}
				displayMode={displayMode}
				onDisplayModeChange={(mode) => onDisplayModeChange?.(mode)}
			/>
			{displayBulkActions && !!selectedAssets.length && (
				<AssetBulkActions
					selection={selectedAssets}
					bulkActions={bulkActions}
					refetch={refetch}
				/>
			)}

			<div
				{...getRootProps()}
				className={'rounded-base relative'}
			>
				<input {...getInputProps()} />
				{isDragActive && (
					<div className='absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 border-2 border-border rounded-base'>
						<UploadIcon className='size-14 text-foreground mb-2' />
						<p className='text-center font-medium'>
							<Trans>Drop files here to upload</Trans>
						</p>
					</div>
				)}
				{displayMode === 'grid' && (
					<AssetGridView
						assets={assets}
						isLoading={isLoadingAssets}
						isAssetSelected={isAssetSelected}
						toggleSelection={toggleAssetSelection}
						onAssetClick={handleSelect}
					/>
				)}
				{displayMode === 'list' && (
					<AssetListView
						assets={assets}
						isLoading={isLoadingAssets}
						isAssetSelected={isAssetSelected}
						toggleSelection={toggleAssetSelection}
						onAssetClick={handleSelect}
					/>
				)}
			</div>
			<div className='flex items-center'>
				<div className='mt-2 text-sm text-foreground flex-shrink-0'>
					<Trans>
						{totalItemsCount} {totalItemsCount === 1 ? 'asset' : 'assets'} found
					</Trans>
					{selectedAssets.length > 0 && <Trans>, {selectedAssets.length} selected</Trans>}
				</div>
				<div className='flex-1'></div>
				{/* Items per page selector */}
				{onPageSizeChange && (
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>
							<Trans>Items per page</Trans>
						</span>
						<Select
							value={pageSize.toString()}
							onValueChange={(value) => {
								if (value == null) return;
								const newPageSize = Number.parseInt(value, 10);
								onPageSizeChange(newPageSize);
								setPage(1); // Reset to first page when changing page size
							}}
						>
							<SelectTrigger className='h-8 w-[70px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent side='top'>
								{[
									12,
									24,
									48,
									96,
								].map((size) => (
									<SelectItem
										key={size}
										value={`${size}`}
									>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				{totalPagesCount > 1 && (
					<AssetsPagination
						page={page}
						goToPage={goToPage}
						totalPagesCount={totalPagesCount}
					/>
				)}
			</div>
		</div>
	);
}
