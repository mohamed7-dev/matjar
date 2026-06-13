import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@matjar/design-system/components/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@matjar/design-system/components/field';
import { Input } from '@matjar/design-system/components/input';
import { useForm } from '@tanstack/react-form';
import { GlobeIcon, Loader2Icon } from 'lucide-react';
import type { SubmitEvent } from 'react';
import { type LoginFormSchema, loginFormSchema } from '@/models/auth.schema.js';
import { Logo } from '../shared/logo.js';

type LoginFormProps = {
	isVerifying?: boolean;
	onFormSubmit: (values: LoginFormSchema) => Promise<void>;
	loginErrorMessage?: string;
};

export function LoginForm({ onFormSubmit, isVerifying }: LoginFormProps) {
	const { t } = useLingui();
	const form = useForm({
		defaultValues: {
			username: '',
			password: '',
		},
		validators: {
			onSubmit: loginFormSchema,
		},
		onSubmit: async ({ value }) => {
			await onFormSubmit(value);
		},
	});

	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		form.handleSubmit();
	};
	return (
		<Card>
			<CardHeader>
				<CardTitle className='space-y-6'>
					<Logo />
					<div className='flex items-center gap-2'>
						<div className='flex items-center gap-2'>
							<GlobeIcon />
							<span>
								<Trans>ADMIN PORTAL</Trans>
							</span>
						</div>
						<span>/</span>
						<h2 className='font-lg font-bold leading-1'>
							<Trans>SIGN IN</Trans>
						</h2>
					</div>
				</CardTitle>
			</CardHeader>

			<CardContent>
				<form
					id='login-form'
					onSubmit={onSubmit}
				>
					<FieldGroup>
						<form.Field
							name='username'
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											<Trans>User Name</Trans>
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder={t`User name`}
											autoComplete='off'
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
						<form.Field
							name='password'
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											<Trans>Password</Trans>
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type='password'
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder={t`Password`}
											autoComplete='off'
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation={'horizontal'}>
					<Button
						type='submit'
						form='login-form'
						className='w-full'
						disabled={isVerifying}
						size={'lg'}
					>
						{isVerifying && (
							<>
								<Loader2Icon className='animate-spin' />
								Please wait
							</>
						)}
						{!isVerifying && <Trans>Sign in</Trans>}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
