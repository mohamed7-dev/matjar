import { createFileRoute, Navigate, redirect, useRouterState } from '@tanstack/react-router';
import z from 'zod';
import { LoginForm } from '@/components/login-form/login-form.js';
import type { LoginFormSchema } from '@/models/auth.schema.js';
import { useAuth } from '@/providers/auth-provider.js';
import { LoginPageStartSide } from './components/login-page-start-side.js';

const fallback = '/' as const;

export const Route = createFileRoute('/login')({
	component: LoginPage,
	validateSearch: z.object({
		redirect: z.string().optional().catch(''),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({
				to: search.redirect || fallback,
			});
		}
	},
});

function LoginPage() {
	const auth = useAuth('LoginPage');
	const isLoading = useRouterState({
		select: (s) => s.isLoading,
	});
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const onFormSubmit = async (values: LoginFormSchema) => {
		auth.login(
			{
				username: values.username,
				password: values.password,
			},
			() => {
				navigate({
					to: '/',
				});
			},
		);
	};

	if (auth.isAuthenticated) {
		return <Navigate to={search.redirect || fallback} />;
	}

	const isVerifying = isLoading || auth.authStatus === 'verifying';

	return (
		<main className='w-full flex bg-background'>
			<LoginPageStartSide />
			<div className='flex-1 w-full flex items-center justify-center'>
				<div className='w-full max-w-[420px]'>
					<LoginForm
						onFormSubmit={onFormSubmit}
						isVerifying={isVerifying}
						loginErrorMessage={auth.authError}
					/>
				</div>
			</div>
		</main>
	);
}
