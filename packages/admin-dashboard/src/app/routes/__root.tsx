import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { AuthContext } from '@/providers/auth-provider.js';

interface MyRouterContext {
	queryClient: QueryClient;
	auth: AuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootDocument,
});

function RootDocument() {
	return (
		<>
			<HeadContent />
			<Outlet />
			<TanStackDevtools
				config={{
					position: 'bottom-right',
				}}
				plugins={[
					{
						name: 'Tanstack Router',
						render: <TanStackRouterDevtoolsPanel />,
					},
					{
						name: 'Tanstack Query',
						render: <ReactQueryDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
