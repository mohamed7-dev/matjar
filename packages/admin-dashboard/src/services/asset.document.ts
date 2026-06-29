import { graphql, type ResultOf } from '@/infra/graphql/gql-tada.config.js';

export const assetFragment = graphql(
	`
    fragment Asset on Asset{
         id
        createdAt
        updatedAt
        languageCode
        name
        fileSize
        mimetype
        type
        previewIdentifier
        sourceIdentifier
        width
        height
        focalPoint {
            x
            y
        }
        translations {
            id
            languageCode
            name
        }
    }
    `,
);

export type AssetFragment = ResultOf<typeof assetFragment>;

export const createAssetsMutationDocument = graphql(
	`
    mutation CreateAssets($input: [CreateAssetsInput!]!){
        createAssets(input: $input) {
                ...Asset
                ... on ApiError {
                    message
                }
        }
    }
    `,
	[
		assetFragment,
	],
);

export const updateAssetMutationDocument = graphql(`
    mutation UpdateAsset($input: UpdateAssetInput!) {
        updateAsset(input: $input) {
            id
        }
    }
`);

export const deleteAssetsMutationDocument = graphql(
	`
    mutation DeleteAssets($input: DeleteAssetsInput!){
        deleteAssets(input: $input) {
                ... on DeletionResponse {
                    message
                    result
                }
        }
    }
    `,
);

export const assetsQueryDocument = graphql(
	`
        query GetAssetList($options: AssetListOptions) {
            assets(options: $options) {
                items {
                    ...Asset
                }
                totalItemsCount
            }
        }
    `,
	[
		assetFragment,
	],
);

export const assetQueryDocument = graphql(
	`
        query GetAsset($id: ID!) {
            asset(id: $id) {
                ...Asset
                tags {
                    id
                    value
                }
            }
        }
    `,
	[
		assetFragment,
	],
);
