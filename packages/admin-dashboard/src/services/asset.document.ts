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
