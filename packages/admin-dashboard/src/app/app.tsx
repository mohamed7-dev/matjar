import { TooltipProvider } from '@matjar/design-system/components/tooltip';
import { createRouter as createTanStackRouter, RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/infra/query/query-client.js';
import { AuthProvider, useAuth } from '@/providers/auth-provider.js';
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

const routerOptions: any = {
	defaultPreload: 'intent' as const,
	scrollRestoration: true,
	basepath: processedBaseUrl,
	context: {
		auth: undefined, // This will be set after we wrap the app in an AuthProvider
		queryClient,
	},
	defaultErrorComponent: ({ error }: { error: Error }) => (
		<div className='text-destructive p-6'>An error occurred: {error.message}</div>
	),
};

const router = createTanStackRouter({
	...routerOptions,
	routeTree,
});

function Providers({ children }: { children: React.ReactNode }) {
	// const [i18nLoaded, setI18nLoaded] = React.useState(false);
	// React.useEffect(() => {
	// 	// With this method we dynamically load the catalogs
	// 	void dynamicActivate(defaultLocale, () => {
	// 		setI18nLoaded(true);
	// 	});
	// }, []);
	return (
		// i18nLoaded && (
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
		// )
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
			{/* {createPortal(<Toaster />, document.body)} */}
		</Providers>
	);
}
