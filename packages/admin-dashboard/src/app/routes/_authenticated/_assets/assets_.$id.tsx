import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { Input } from '@matjar/design-system/components/input';
import { Label } from '@matjar/design-system/components/label';
import { createFileRoute } from '@tanstack/react-router';
import { FocusIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { AssetFocalPointEditor } from '@/components/asset/asset-focal-point-editor.js';
import { AssetInfo } from '@/components/asset/asset-info.js';
import { AssetSizeSelector } from '@/components/asset/asset-size-selector.js';
import { Image, type ImagePreset } from '@/components/image/image.js';
import { Page, PageActionBar, PageActionBarItem, PageTitle } from '@/components/layout-engine/page.js';
import { PageBlock } from '@/components/layout-engine/page-block.js';
import { PageLayout } from '@/components/layout-engine/page-layout.js';
import { ErrorPage } from '@/components/page/error-page.js';
import { TranslatableFormField } from '@/components/shared/translatable-form-field.js';
import { useDetailPage } from '@/hooks/use-detail-page.js';
import { assetQueryDocument, updateAssetMutationDocument } from '@/services/asset.document.js';

const pageId = 'asset-detail';

export const Route = createFileRoute('/_authenticated/_assets/assets_/$id')({
	component: AssetPage,
	errorComponent: ({ error }) => <ErrorPage message={error.message} />,
});

function AssetPage() {
	const params = Route.useParams();
	const { t } = useLingui();
	const [size, setSize] = React.useState<ImagePreset>('medium');
	const imageRef = React.useRef<HTMLImageElement>(null);
	const [imageWidth, setImageWidth] = React.useState(0);
	const [imageHeight, setImageHeight] = React.useState(0);
	const [isFocalPointLocatorActive, setIsFocalPointLocatorActive] = React.useState(false);

	const { entity, form, submitHandler, isPending } = useDetailPage({
		queryDocument: assetQueryDocument,
		updateDocument: updateAssetMutationDocument,
		pageParams: {
			id: params.id,
		},
		setValuesForUpdate: (entity) => {
			const translations = entity.translations.map((t) => ({
				id: t.id,
				languageCode: t.languageCode,
				name: t.name,
			}));

			return {
				id: entity.id,
				focalPoint: entity.focalPoint,
				translations,
				tags: entity.tags?.map((tag) => tag.value) ?? [],
			};
		},
		onSuccess: async () => {
			toast(t`Successfully updated asset`);
			form.reset(form.getValues());
		},
		onError: (err) => {
			toast(t`Failed to update asset`, {
				description: err instanceof Error ? err.message : 'Unknown error',
			});
		},
	});

	const updateDimensions = () => {
		if (!imageRef.current) return;
		const img = imageRef.current;
		const imgWidth = img.naturalWidth;
		const imgHeight = img.naturalHeight;
		setImageWidth(imgWidth);
		setImageHeight(imgHeight);
	};

	if (!entity) return null;

	return (
		<Page
			pageId={pageId}
			form={form}
			submitHandler={submitHandler}
			entity={entity}
		>
			<PageTitle>
				<Trans>Edit asset</Trans>
			</PageTitle>
			<PageActionBar>
				<PageActionBarItem
					id='update-button'
					requiredPermissions={[
						'platform_asset_update',
					]}
				>
					<Button
						type='submit'
						disabled={!form.formState.isDirty || isPending}
					>
						<Trans>Update</Trans>
					</Button>
				</PageActionBarItem>
			</PageActionBar>
			<PageLayout>
				<PageBlock
					column='main'
					id='asset-preview'
				>
					<div className='relative flex items-center justify-center bg-secondary-background/50 rounded-lg min-h-[300px] overflow-auto resize-y'>
						<AssetFocalPointEditor
							focalPoint={entity.focalPoint ?? undefined}
							isFocalPointLocatorActive={isFocalPointLocatorActive}
							imageWidth={imageWidth}
							imageHeight={imageHeight}
							onCancel={() => {
								setIsFocalPointLocatorActive(false);
							}}
							onFocalPointChange={(focalPoint) => {
								form.setValue('focalPoint.x', focalPoint.x, {
									shouldDirty: true,
								});
								form.setValue('focalPoint.y', focalPoint.y, {
									shouldDirty: true,
								});
								setIsFocalPointLocatorActive(false);
							}}
						>
							<Image
								ref={imageRef}
								asset={{
									...entity,
									url: entity.previewIdentifier,
								}}
								transform={{
									useFocalPoint: true,
									preset: size,
								}}
								onLoad={updateDimensions}
								className='max-w-full object-contain'
							/>
						</AssetFocalPointEditor>
					</div>
				</PageBlock>
				<PageBlock
					column='side'
					id='asset-name'
				>
					<TranslatableFormField
						control={form.control}
						name='name'
						label={<Trans>Name</Trans>}
						render={({ field }) => <Input {...field} />}
					/>
				</PageBlock>
				<PageBlock
					column='side'
					id='asset-info'
				>
					<AssetInfo asset={entity} />
				</PageBlock>
				<PageBlock
					column='side'
					id='asset-size'
				>
					<div className='flex flex-col gap-2'>
						<AssetSizeSelector
							size={size}
							onSizeChange={setSize}
							width={imageWidth}
							height={imageHeight}
						/>
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='noShadow'
								size='icon'
								onClick={() => setIsFocalPointLocatorActive(true)}
							>
								<FocusIcon />
							</Button>
							<div className='text-sm text-foreground/80'>
								<Label>
									<Trans>Focal Point</Trans>
								</Label>
								<div>
									{form.getValues().focalPoint?.x && form.getValues().focalPoint?.y ? (
										`${form.getValues().focalPoint?.x.toFixed(2)}, ${form.getValues().focalPoint?.y.toFixed(2)}`
									) : (
										<Trans>Not set</Trans>
									)}
								</div>
							</div>
						</div>
					</div>
				</PageBlock>
				<PageBlock
					column='side'
					id='asset-tags'
				>
					Asset Tags Editor
				</PageBlock>
			</PageLayout>
		</Page>
	);
}
