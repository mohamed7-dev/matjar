import { graphql } from '@/infra/graphql/gql-tada.config.js';

const administratorFragment = graphql(`
    fragment AdministratorItem on Administrator{
        id
        createdAt
        updatedAt
        firstName
        lastName
        identifier
        user {
            id
            lastAuthenticatedAt
            identifier
        }
    }
    `);

export const administratorsQueryDocument = graphql(
	`
    query AdministratorList ($options: AdministratorListOptions){
        administrators(options: $options) {
            totalItemsCount
            items {
                ...AdministratorItem
            }
        }
    }
    `,
	[
		administratorFragment,
	],
);
