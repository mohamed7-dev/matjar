import React from 'react';
import { useAuth } from '@/providers/auth-provider.js';
import { useMarketplaceRegion } from '@/providers/marketplace-region-provider.js';

export function usePermissions() {
	const { marketplaceRegions: userMarketplaces } = useAuth('usePermissions');
	const {
		state: { activeMarketplaceRegion },
	} = useMarketplaceRegion('usePermissions');

	const hasPermissions = React.useCallback(
		(permissions: string[]) => {
			const currentUserMarketplace = (userMarketplaces ?? [])?.find(
				(mp) => mp.id === activeMarketplaceRegion?.id,
			);
			if (!currentUserMarketplace) return false;
			return permissions.some((p) =>
				currentUserMarketplace.permissions.includes(
					p as (typeof currentUserMarketplace)['permissions'][number],
				),
			);
		},
		[
			userMarketplaces,
			activeMarketplaceRegion?.id,
		],
	);

	return {
		hasPermissions,
	};
}
