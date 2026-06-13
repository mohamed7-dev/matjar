import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@matjar/design-system/components/card';
import { cn } from '@matjar/design-system/lib/utils';
import React from 'react';
import { PageBlockProvider } from './page-block-provider.js';

export interface PageBlockProps {
	id: string;
	column: 'side' | 'main' | 'full';
	children?: React.ReactNode;
	title?: React.ReactNode | string;
	description?: React.ReactNode | string;
	className?: string;
}

export function PageBlock(props: PageBlockProps) {
	const { id, title, description, column, className, children } = props;
	const contextValue = React.useMemo(
		() => ({
			id,
			title,
			description,
			column,
		}),
		[
			id,
			title,
			description,
			column,
		],
	);

	return (
		<PageBlockProvider {...contextValue}>
			<Card className={cn('@container  w-full', className, 'animate-in fade-in duration-300')}>
				{title || description ? (
					<CardHeader>
						{title && <CardTitle>{title}</CardTitle>}
						{description && <CardDescription>{description}</CardDescription>}
					</CardHeader>
				) : null}
				<CardContent>{children}</CardContent>
			</Card>
		</PageBlockProvider>
	);
}

export function FullWidthPageBlock({
	children,
	className,
	id,
}: Pick<PageBlockProps, 'children' | 'className' | 'id'>) {
	const contextValue = React.useMemo(
		() => ({
			id,
			column: 'main' as const,
		}),
		[
			id,
		],
	);
	return (
		<PageBlockProvider {...contextValue}>
			<div className={cn('w-full', className, 'animate-in fade-in duration-300')}>{children}</div>
		</PageBlockProvider>
	);
}
