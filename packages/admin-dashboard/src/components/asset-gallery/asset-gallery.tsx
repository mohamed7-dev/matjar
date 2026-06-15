import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { Input } from '@matjar/design-system/components/input';
import { cn } from '@matjar/design-system/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchIcon, UploadIcon } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/infra/graphql/api.js';
import { createAssetsMutationDocument } from '@/services/asset.document.js';
import { PageActionBar, PageActionBarItem } from '../layout-engine/page.js';

export function AssetGallery() {
	const { t } = useLingui();
	const qClient = useQueryClient();
	const [searchInput, setSearchInput] = React.useState('');

	// TODO: add pagination states, filters, and search input to the list
	const queryKey = [
		'AssetGallery',
	];

	const { mutate: createAssets } = useMutation({
		mutationFn: api.mutate(createAssetsMutationDocument),
		// onSuccess: () => {
		// 	qClient.invalidateQueries({
		// 		queryKey,
		// 	});
		// },
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

	return (
		<div className='flex flex-col w-full gap-2'>
			<div className='flex flex-col md:flex-row gap-2'>
				<div className='flex-1 flex items-center gap-2 relative'>
					<SearchIcon className='size-4 absolute left-2 top-2.5' />
					<Input
						placeholder={t`Search assets...`}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className='pl-8'
					/>
				</div>
				<p>TODO: Filters Select Menu</p>
				<p>TODO: View Mode Toggle Group</p>
				<PageActionBar>
					<PageActionBarItem id='upload-assets-button'>
						<Button
							onClick={openFileDialog}
							className='whitespace-nowrap'
						>
							<UploadIcon className='size-4 mr-2' /> <Trans>Upload</Trans>
						</Button>
					</PageActionBarItem>
				</PageActionBar>
			</div>
			<div
				{...getRootProps()}
				className={cn('rounded-sm relative')}
			>
				<input {...getInputProps()} />
				{isDragActive && (
					<div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border-2 border-border rounded-sm'>
						<UploadIcon className='size-14 text-foreground mb-2' />
						<p className='text-center font-medium'>
							<Trans>Drop files here to upload</Trans>
						</p>
					</div>
				)}
				<div className='h-40 bg-secondary-background border-2 border-border p-2 rounded-sm'>
					Grid View
				</div>
			</div>
		</div>
	);
}
