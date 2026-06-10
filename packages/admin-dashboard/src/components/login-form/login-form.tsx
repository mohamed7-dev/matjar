import { useForm } from '@tanstack/react-form';
import { GlobeIcon, Loader2Icon } from 'lucide-react';
import React, { type SubmitEvent } from 'react';
import { type LoginFormSchema, loginFormSchema } from '@/models/auth.schema.js';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field.js';
import { Input } from '../ui/input.js';

type LoginFormProps = {
	isVerifying?: boolean;
	onFormSubmit: (values: LoginFormSchema) => Promise<void>;
	loginErrorMessage?: string;
};

export function LoginForm({ onFormSubmit, isVerifying }: LoginFormProps) {
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
			{/* Mobile logo */}
			{/* <div className='flex lg:hidden items-center gap-3 mb-8'>
				<div
					className='w-9 h-9 flex items-center justify-center'
					style={{
						backgroundColor: '#FFE500',
						border: '3px solid #000',
					}}
				>
					<ShoppingBag
						size={18}
						color='#000'
						strokeWidth={2.5}
					/>
				</div>
				<span
					style={{
						fontSize: '18px',
						fontWeight: 900,
						letterSpacing: '-0.5px',
					}}
				>
					NEXUS COMMERCE
				</span>
			</div> */}

			<CardHeader className='border-b-0'>
				<CardTitle>
					<div className='flex items-center gap-2'>
						<GlobeIcon />
						<span>ADMIN PORTAL</span>
					</div>
					<h2 className='mt-4 font-lg font-bold leading-1'>SIGN IN</h2>
				</CardTitle>
			</CardHeader>

			<CardContent>
				<form
					id='login-form'
					onSubmit={onSubmit}
					// className='space-y-5'
				>
					<FieldGroup>
						<form.Field
							name='username'
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel
											htmlFor={field.name}
											className='font-bold'
										>
											User Name
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											// placeholder="Login button not working on mobile"
											autoComplete='off'
										/>
										{isInvalid && (
											<FieldError
												style={{
													padding: '10px 14px',
													backgroundColor: '#FF6B6B',
													border: '3px solid #000',
													color: '#000',
													fontSize: '13px',
													fontWeight: 700,
												}}
												errors={field.state.meta.errors}
											/>
										)}
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
										<FieldLabel
											htmlFor={field.name}
											className='font-bold'
										>
											Password
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type='password'
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											// placeholder="Login button not working on mobile"
											autoComplete='off'
										/>
										{isInvalid && (
											<FieldError
												style={{
													padding: '10px 14px',
													backgroundColor: '#FF6B6B',
													border: '3px solid #000',
													color: '#000',
													fontSize: '13px',
													fontWeight: 700,
												}}
												errors={field.state.meta.errors}
											/>
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter className='border-t-0'>
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
						{!isVerifying &&
							// <Trans>Sign in</Trans>
							'Sign in'}
					</Button>
				</Field>
			</CardFooter>

			{/* <div className='mt-4 flex gap-3'>
				{[
					'EG-Store',
					'KSA-Store',
				].map((region) => (
					<div
						key={region}
						style={{
							padding: '6px 12px',
							backgroundColor: '#fff',
							border: '2px solid #000',
							fontSize: '11px',
							fontWeight: 800,
							letterSpacing: '0.5px',
						}}
					>
						{region}
					</div>
				))}
			</div> */}
		</Card>
	);
}
