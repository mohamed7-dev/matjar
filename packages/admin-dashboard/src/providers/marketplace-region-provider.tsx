import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { api } from '@/infra/graphql/api.js';
import type { ResultOf } from '@/infra/graphql/gql-tada.config.js';
import { createContext } from '@/lib/create-context.js';
import { LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY } from '@/lib/keys.js';
import {
	ActiveMarketplaceRegionQueryDocument,
	type MarketplaceRegionFragment,
	MarketplaceRegionsQueryDocument,
} from '@/services/marketplace-region.document.js';
import { useAuth } from './auth-provider.js';
import { useUserSettings } from './user-settings-provider.js';

export function setMarketplaceRegionTokenInLocalStorage(token: string) {
	try {
		localStorage.setItem(LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY, token);
	} catch (e) {
		console.error('Error while storing active marketplace region in localStorage', e);
	}
}

export function removeMarketplaceRegionTokenFromLocalStorage() {
	try {
		localStorage.removeItem(LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY);
	} catch (e) {
		console.error('Error while removing active marketplace region from localStorage', e);
	}
}

export function getMarketplaceRegionTokenFromLocalStorage(): string | null {
	try {
		return localStorage.getItem(LOCAL_STORAGE_ACTIVE_MARKETPLACE_REGION_TOKEN_KEY);
	} catch (e) {
		console.error('Error while getting marketplace region token from localStorage', e);
		return null;
	}
}

type ActiveMarketplaceRegion = ResultOf<
	typeof ActiveMarketplaceRegionQueryDocument
>['activeMarketplaceRegion'];
export type MarketplaceRegion = ResultOf<typeof MarketplaceRegionFragment>;

type MarketplaceRegionContext = {
	state: {
		isQueryActive: boolean;
		marketplaceRegions: MarketplaceRegion[];
		activeMarketplaceRegion: ActiveMarketplaceRegion | undefined;
	};
	actions: {
		setActiveMarketplaceRegion: (marketplaceRegionId: string) => void;
		refreshMarketplaceRegions: () => void;
	};
};

const [MarketplaceRegionContextProvider, useMarketplaceRegion] = createContext<MarketplaceRegionContext>(
	'MarketplaceRegionContext',
	undefined,
);

interface MarketplaceRegionProviderProps {
	children: React.ReactNode;
}

export function MarketplaceRegionProvider({ children }: MarketplaceRegionProviderProps) {
	const {
		state: { settings },
		actions: { setActiveMarketplaceRegionId },
	} = useUserSettings('MarketplaceRegionProvider');
	const {
		isAuthenticated,
		marketplaceRegions: userMarketplaceRegions,
		refreshActiveUser,
	} = useAuth('MarketplaceRegionProvider');

	const queryClient = useQueryClient();

	const [selectedMarketplaceRegionId, setSelectedMarketplaceRegionId] = React.useState<string | undefined>(
		settings.activeMarketplaceRegionId,
	);

	const { data: marketplaceRegionsData } = useQuery({
		queryKey: [
			'marketplaceRegions',
			isAuthenticated,
		],
		queryFn: () => api.query(MarketplaceRegionsQueryDocument),
		retry: false,
		enabled: isAuthenticated,
	});

	const { data: activeMarketplaceRegionData, isLoading: isActiveMarketplaceRegionLoading } = useQuery({
		queryKey: [
			'activeMarketplaceRegion',
			isAuthenticated,
		],
		queryFn: () => api.query(ActiveMarketplaceRegionQueryDocument),
		retry: false,
		enabled: isAuthenticated,
	});

	const marketplaceRegions: MarketplaceRegion[] = React.useMemo(() => {
		// sales channels which has the current user as a member
		// takes priority over marketplaceRegionsData
		if (userMarketplaceRegions?.length && userMarketplaceRegions?.length > 0) {
			return userMarketplaceRegions.map((mp) => {
				const marketplaceRegionData = marketplaceRegionsData?.marketplaceRegions.items.find(
					(m) => m.id === mp.id,
				);
				return {
					id: mp.id,
					code: marketplaceRegionData?.code ?? mp.code,
					token: marketplaceRegionData?.token ?? mp.token,
					primaryLanguageCode: marketplaceRegionData?.primaryLanguageCode || 'en',
					primaryCurrencyCode: marketplaceRegionData?.primaryCurrencyCode || 'USD',
					availableLanguageCodes: marketplaceRegionData?.availableLanguageCodes || [
						'en',
					],
					availableCurrencyCodes: marketplaceRegionData?.availableCurrencyCodes || [
						'USD',
					],
				};
			});
		}
		return marketplaceRegionsData?.marketplaceRegions.items || ([] as MarketplaceRegion[]);
	}, [
		userMarketplaceRegions,
		marketplaceRegionsData?.marketplaceRegions.items,
	]);

	const refreshMarketplaceRegions = React.useCallback(() => {
		refreshActiveUser();
		queryClient.invalidateQueries({
			queryKey: [
				'marketplaceRegions',
			],
		});
		queryClient.invalidateQueries({
			queryKey: [
				'activeMarketplaceRegion',
			],
		});
	}, [
		queryClient,
		refreshActiveUser,
	]);

	const setSelectedMarketplace = React.useCallback(
		(marketplaceId: string) => {
			const marketplace = marketplaceRegions.find((c) => c.id === marketplaceId);
			if (marketplace) {
				setMarketplaceRegionTokenInLocalStorage(marketplace.token);
				setSelectedMarketplaceRegionId(marketplaceId);
				setActiveMarketplaceRegionId(marketplaceId);
				queryClient.invalidateQueries();
			}
		},
		[
			queryClient,
			marketplaceRegions,
			setActiveMarketplaceRegionId,
		],
	);

	React.useEffect(() => {
		const validMarketplaces = marketplaceRegions.map((m) => m.id);

		if (
			selectedMarketplaceRegionId &&
			validMarketplaces.length &&
			!validMarketplaces.includes(selectedMarketplaceRegionId)
		) {
			setSelectedMarketplaceRegionId(undefined);
		} else if (selectedMarketplaceRegionId && marketplaceRegions.length > 0) {
			// TODO: understand this block
			// Ensure marketplace token in localStorage stays in sync with selected marketplace.
			// This handles the case where activeMarketplaceId persists but the token was cleared (e.g., after logout).
			const selectedMarketplace = marketplaceRegions.find((m) => m.id === selectedMarketplaceRegionId);
			if (selectedMarketplace) {
				const currentToken = getMarketplaceRegionTokenFromLocalStorage();
				if (currentToken !== selectedMarketplace.token) {
					setMarketplaceRegionTokenInLocalStorage(selectedMarketplace.token);
					// Invalidate queries to refetch with the corrected token
					queryClient.invalidateQueries({
						queryKey: [
							'activeMarketplaceRegion',
							isAuthenticated,
						],
					});
				}
			}
		} else if (marketplaceRegions.length > 0) {
			// when user settings doesn't have active marketplace
			// and UI doesn't have selected marketplace
			// -- In other words when this run for the first time
			// in this case set the first marketplace in the list as the active one
			const defaultMarketplace = marketplaceRegions[0];
			setMarketplaceRegionTokenInLocalStorage(defaultMarketplace.token);
			setSelectedMarketplaceRegionId(defaultMarketplace.id);
		}
	}, [
		marketplaceRegions,
		selectedMarketplaceRegionId,
		isAuthenticated,
		queryClient,
	]);

	const isQueryActive = isActiveMarketplaceRegionLoading;

	const contextValue = React.useMemo(() => {
		return {
			state: {
				marketplaceRegions,
				activeMarketplaceRegion: activeMarketplaceRegionData?.activeMarketplaceRegion,
				isQueryActive,
			},
			actions: {
				refreshMarketplaceRegions,
				setActiveMarketplaceRegion: setSelectedMarketplace,
			},
		} satisfies MarketplaceRegionContext;
	}, [
		marketplaceRegions,
		activeMarketplaceRegionData,
		isQueryActive,
		refreshMarketplaceRegions,
		setSelectedMarketplace,
	]);
	return <MarketplaceRegionContextProvider {...contextValue}>{children}</MarketplaceRegionContextProvider>;
}

export { useMarketplaceRegion };
