import { graphql } from '@/infra/graphql/gql-tada.config.js';

export const LoginMutationDocument = graphql(`
    mutation Login($username: String!, $password: String!) {
        authenticateAdminUser(
            input: { native: { identifier: $username, password: $password } }
        ) {
            __typename
            ... on AuthenticatedAdminUser {
                id
                identifier
                marketplaceRegions{
                    id
                    token
                    code
                    permissions
                }
            }
            ... on ApiError {
                message
                errorCode
            }
        }
    }
`);

export const LogoutMutationDocument = graphql(`
    mutation Logout  {
        logoutAdminUser{
            success
        }
    }
`);

export const ActiveUserQueryDocument = graphql(`
    query ActiveUserInfo {
        me {
            id
            identifier
            marketplaceRegions{
                    id
                    token
                    code
                    permissions
                }
        }
        activeAdministrator{
            id
            firstName
            lastName
            identifier
        }
    }
`);
