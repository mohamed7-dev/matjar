import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { AuthenticatedLayout as BaseAuthenticatedLayout } from '@/components/app-layout/authenticated-layout.js';
import { useAuth } from '@/providers/auth-provider.js';

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
	beforeLoad: ({ context, location }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: '/login',
				search: {
					redirect: location.href,
				},
			});
		}
	},
	loader: () => ({
		breadcrumb: 'Insights',
	}),
});

function AuthenticatedLayout() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth('AuthenticatedLayout');

	if (!isAuthenticated) {
		navigate({
			to: '/login',
		});
		return null;
	}

	return <BaseAuthenticatedLayout />;
}
