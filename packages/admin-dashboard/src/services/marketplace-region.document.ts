import { graphql } from '@/infra/graphql/gql-tada.config.js';

export const MarketplaceRegionFragment = graphql(`
    fragment MarketplaceRegionInfo on MarketplaceRegion {
        id
        code
        token
        primaryLanguageCode
        primaryCurrencyCode
        availableLanguageCodes
        availableCurrencyCodes
    }
`);

export const ActiveMarketplaceRegionQueryDocument = graphql(
	`
        query ActiveMarketplaceRegionInfo {
            activeMarketplaceRegion {
                ...MarketplaceRegionInfo
            }
        }
    `,
	[
		MarketplaceRegionFragment,
	],
);

export const MarketplaceRegionsQueryDocument = graphql(
	`
        query MarketplaceRegionsInfo {
            marketplaceRegions {
                items {
                    ...MarketplaceRegionInfo
                }
                totalItemsCount
            }
        }
    `,
	[
		MarketplaceRegionFragment,
	],
);
