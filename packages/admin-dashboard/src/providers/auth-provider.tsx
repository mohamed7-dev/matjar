import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { api } from '@/infra/graphql/api.js';
import type { ResultOf } from '@/infra/graphql/gql-tada.config.js';
import { createContext } from '@/lib/create-context.js';
import { LOCAL_STORAGE_SESSION_TOKEN_KEY } from '@/lib/keys.js';
import {
	ActiveUserQueryDocument,
	LoginMutationDocument,
	LogoutMutationDocument,
} from '@/services/auth.documents.js';
import {
	removeMarketplaceRegionTokenFromLocalStorage,
	setMarketplaceRegionTokenInLocalStorage,
} from './marketplace-region-provider.js';
import { useUserSettings } from './user-settings-provider.js';

const ACTIVE_USER_QUERY_KEY = 'activeUser';

type Credentials = {
	username: string;
	password: string;
};

export interface AuthContext {
	isAuthenticated: boolean;
	/**
	 * @description
	 * The status of the authentication.
	 */
	authStatus: 'initial' | 'authenticated' | 'verifying' | 'unauthenticated';
	/**
	 * @description
	 * The error message if the authentication fails.
	 */
	authError?: string;
	/**
	 * @description
	 * The function to login the user.
	 */
	login: (credentials: Credentials, onSuccess?: () => void) => void;
	/**
	 * @description
	 * The function to logout the user.
	 */
	logout: (onSuccess?: () => void) => Promise<void>;
	/**
	 * @description
	 * The function to refresh the current user.
	 */
	refreshActiveUser: () => void;
	/**
	 * @description
	 * The user object.
	 */
	user: ResultOf<typeof ActiveUserQueryDocument>['activeAdministrator'] | undefined;
	/**
	 * @description
	 * The marketplace regions the active user has roles in them
	 */
	marketplaceRegions:
		| NonNullable<ResultOf<typeof ActiveUserQueryDocument>['me']>['marketplaceRegions']
		| undefined;
}

const [AuthContextProvider, useAuth] = createContext<AuthContext>('AuthContext', undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}
export function AuthProvider({ children }: AuthProviderProps) {
	const queryClient = useQueryClient();
	const {
		state: { settings },
		actions: { setActiveMarketplaceRegionId },
	} = useUserSettings('AuthProvider');
	const [authStatus, setAuthStatus] = React.useState<AuthContext['authStatus']>('initial');
	const [authError, setAuthError] = React.useState<string | undefined>();
	const [isActiveAuthMutationInProgress, setIsActiveAuthMutationInProgress] = React.useState(false);

	const {
		data: activeUserData,
		isLoading: isLoadingActiveUser,
		error: activeUserError,
		refetch: refetchActiveUser,
	} = useQuery({
		queryKey: [
			ACTIVE_USER_QUERY_KEY,
		],
		queryFn: () => {
			return api.query(ActiveUserQueryDocument);
		},
		retry: false, // Disable retries to avoid waiting for multiple attempts
	});

	const login = React.useCallback(
		(credentials: Credentials, onSuccess?: () => void) => {
			api.mutate(LoginMutationDocument)({
				username: credentials.username,
				password: credentials.password,
			}).then(async (data) => {
				if (data.authenticateAdminUser.__typename === 'AuthenticatedAdminUser') {
					setAuthError(undefined);
					const { data: refetchedData } = await refetchActiveUser();
					if (refetchedData?.me?.marketplaceRegions?.length) {
						const previousMarketplaceRegion = settings.activeMarketplaceRegionId
							? refetchedData.me.marketplaceRegions.find(
									(c) => c.id === settings.activeMarketplaceRegionId,
								)
							: undefined;
						const marketplace =
							previousMarketplaceRegion ?? refetchedData.me.marketplaceRegions[0];
						setMarketplaceRegionTokenInLocalStorage(marketplace.token as string);

						setActiveMarketplaceRegionId(marketplace.id);
					}
					await queryClient.invalidateQueries();
					setAuthStatus('authenticated');
					setIsActiveAuthMutationInProgress(false);
					onSuccess?.();
				} else {
					setAuthError(data?.authenticateAdminUser.message);
					setAuthStatus('unauthenticated');
					setIsActiveAuthMutationInProgress(false);
				}
			});
		},
		[
			queryClient,
			refetchActiveUser,
			setActiveMarketplaceRegionId,
			settings.activeMarketplaceRegionId,
		],
	);

	const logout = React.useCallback(
		async (onLogoutSuccess?: () => void) => {
			setIsActiveAuthMutationInProgress(true);
			setAuthStatus('verifying');
			api.mutate(LogoutMutationDocument)({}).then(async (data) => {
				if (data?.logoutAdminUser.success) {
					localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
					queryClient.clear();
					removeMarketplaceRegionTokenFromLocalStorage();
					setAuthStatus('unauthenticated');
					setIsActiveAuthMutationInProgress(false);
					onLogoutSuccess?.();
				}
			});
		},
		[
			queryClient,
		],
	);

	const invalidateActiveUser = React.useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: [
				ACTIVE_USER_QUERY_KEY,
			],
		});
	}, [
		queryClient,
	]);

	React.useEffect(() => {
		// we must not perform any side effect while a mutation is active
		if (isActiveAuthMutationInProgress) return;

		if (authStatus === 'initial' && isLoadingActiveUser) {
			// user info is being loaded and the auth status indicates that no authentication happened
			// so this is considered an active verification
			setAuthStatus('verifying');
		}

		if (!isLoadingActiveUser && authStatus === 'verifying') {
			// user info is done being loaded and the auth status indicates that authentication is done verifying
			// so we need to decide the auth state
			if (!activeUserError || !activeUserData?.me?.id) {
				setAuthStatus('unauthenticated');
			} else {
				setAuthStatus('authenticated');
			}
		}
	}, [
		authStatus,
		isLoadingActiveUser,
		activeUserError,
		activeUserData,
		isActiveAuthMutationInProgress,
	]);

	const isAuthenticated = !!activeUserData?.me?.id;

	const contextValue = React.useMemo(() => {
		return {
			login,
			logout,
			authError,
			authStatus,
			isAuthenticated,
			refreshActiveUser: invalidateActiveUser,
			marketplaceRegions: activeUserData?.me?.marketplaceRegions,
			user: activeUserData?.activeAdministrator,
		} satisfies AuthContext;
	}, [
		login,
		logout,
		authError,
		authStatus,
		invalidateActiveUser,
		isAuthenticated,
		activeUserData,
	]);
	return <AuthContextProvider {...contextValue}>{children}</AuthContextProvider>;
}

export { useAuth };
