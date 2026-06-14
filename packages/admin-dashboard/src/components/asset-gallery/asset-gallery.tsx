import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { Input } from '@matjar/design-system/components/input';
import { SearchIcon, UploadIcon } from 'lucide-react';
import React from 'react';
import { PageActionBar, PageActionBarItem } from '../layout-engine/page.js';

export function AssetGallery() {
	const { t } = useLingui();
	const [searchInput, setSearchInput] = React.useState('');

	const openFileDialog = () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true;
		fileInput.addEventListener('change', (event) => {
			const target = event.target as HTMLInputElement;
			if (target.files) {
				const filesList = Array.from(target.files);
				// TODO: invoke onDrop cb
			}
		});
		fileInput.click();
	};

	return (
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
	);
}
