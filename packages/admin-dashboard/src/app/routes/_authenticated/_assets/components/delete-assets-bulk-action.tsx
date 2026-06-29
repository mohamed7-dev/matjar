import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BulkAction } from '@/components/shared/bulk-action.js';
import type { ResultOf } from '@/infra/graphql//gql-tada.config.js';
import { api } from '@/infra/graphql/api.js';
import { type AssetFragment, deleteAssetsMutationDocument } from '@/services/asset.document.js';

export function DeleteAssetsBulkAction({
	selection,
	refetch,
}: {
	selection: AssetFragment[];
	refetch: () => void;
}) {
	const { t } = useLingui();
	const selectionLength = selection.length;
	const { mutate } = useMutation({
		mutationFn: api.mutate(deleteAssetsMutationDocument),
		onSuccess: (result: ResultOf<typeof deleteAssetsMutationDocument>) => {
			if (result.deleteAssets.result === 'DELETED') {
				toast.success(t`Deleted ${selectionLength} assets`);
			} else {
				const message = result.deleteAssets.message;
				toast.error(t`Failed to delete assets: ${message}`);
			}
			refetch();
		},
		onError: () => {
			toast.error(`Failed to delete ${selectionLength} assets`);
		},
	});

	return (
		<BulkAction
			permissions={[
				'platform_asset_delete',
				'platform_catalog_delete',
			]}
			onExecute={() =>
				mutate({
					input: {
						ids: selection.map((s) => s.id),
					},
				})
			}
			label={<Trans>Delete</Trans>}
			confirm={<Trans>Are you sure you want to delete {selectionLength} assets?</Trans>}
			icon={TrashIcon}
			keepMenuOpen={false}
		/>
	);
}
