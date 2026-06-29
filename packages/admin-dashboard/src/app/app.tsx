import { Toaster } from '@matjar/design-system/components/sonner';
import { TooltipProvider } from '@matjar/design-system/components/tooltip';
import { createRouter as createTanStackRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { createPortal } from 'react-dom';
import { queryClient } from '@/infra/query/query-client.js';
import { defaultLocale, dynamicActivate } from '@/lib/i18n.js';
import { AuthProvider, useAuth } from '@/providers/auth-provider.js';
import { I18nProvider } from '@/providers/i18n-provider.js';
import { MarketplaceRegionProvider } from '@/providers/marketplace-region-provider.js';
import { QueryClientProvider } from '@/providers/query-client-provider.js';
import { ThemeProvider } from '@/providers/theme-provider.js';
import { UserSettingsProvider } from '@/providers/user-settings-provider.js';
import { routeTree } from './routeTree.gen.js';

const processedBaseUrl = (() => {
	const baseUrl = import.meta.env.BASE_URL;
	if (!baseUrl || baseUrl === '/') return undefined;
	// Ensure leading slash, remove trailing slash
	const normalized = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
	return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
})();

const router = createTanStackRouter({
	routeTree,
	defaultPreload: 'intent',
	scrollRestoration: true,
	basepath: processedBaseUrl,
	context: {
		auth: undefined, // This will be set after we wrap the app in an AuthProvider
		queryClient,
	},
	defaultErrorComponent: ({ error }: { error: Error }) => (
		<div className='text-red-500 p-6'>An error occurred: {error.message}</div>
	),
});

function Providers({ children }: { children: React.ReactNode }) {
	const [i18nLoaded, setI18nLoaded] = React.useState(false);
	React.useEffect(() => {
		// With this method we dynamically load the catalogs
		void dynamicActivate(defaultLocale, () => {
			setI18nLoaded(true);
		});
	}, []);
	return (
		i18nLoaded && (
			<I18nProvider>
				<QueryClientProvider>
					<UserSettingsProvider>
						<ThemeProvider defaultTheme='light'>
							<AuthProvider>
								<MarketplaceRegionProvider>
									<TooltipProvider>{children}</TooltipProvider>
								</MarketplaceRegionProvider>
							</AuthProvider>
						</ThemeProvider>
					</UserSettingsProvider>
				</QueryClientProvider>
			</I18nProvider>
		)
	);
}

function InnerApp() {
	const auth = useAuth('InnerApp');
	return (
		<RouterProvider
			router={router}
			context={{
				queryClient,
				auth,
			}}
		/>
	);
}

export function App() {
	return (
		<Providers>
			<InnerApp />
			{createPortal(<Toaster />, document.body)}
		</Providers>
	);
}
