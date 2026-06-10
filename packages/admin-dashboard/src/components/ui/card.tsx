import type * as React from 'react';

import { cn } from '@/lib/cn.js';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card'
			className={cn(
				'flex flex-col gap-6 border-4 border-black bg-card py-8 px-8 text-card-foreground shadow-lg',
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-header'
			className={cn(
				'@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-3 -mx-8 -mt-8 px-8 py-8 border-b-4 border-black has-data-[slot=card-action]:grid-cols-[1fr_auto]',
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-title'
			className={cn('leading-none font-semibold', className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-description'
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-action'
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-content'
			className={cn('px-0', className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-footer'
			className={cn('flex items-center -mx-8 -mb-8 px-8 py-8 border-t-4 border-black', className)}
			{...props}
		/>
	);
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
