/** biome-ignore-all lint/suspicious/noArrayIndexKey: no other unique identifier available when processing react children */

import { Button } from '@matjar/design-system/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@matjar/design-system/components/dropdown-menu';
import { useIsMobile } from '@matjar/design-system/hooks/use-mobile';
import { cn } from '@matjar/design-system/lib/utils';
import { EllipsisVerticalIcon } from 'lucide-react';
import React from 'react';
import { type PageContextProps, PageProvider, usePage } from './page-provider.js';

interface PageProps extends React.ComponentProps<'div'> {
	children: React.ReactNode;
	form?: any;
	submitHandler?: any;
	entity?: any;
	pageId: string;
}

export function Page(props: PageProps) {
	const { children, entity, submitHandler, form, pageId, ...restProps } = props;
	const childrenArray = React.Children.toArray(children);

	const pageTitle = childrenArray.find((child) => isOfType(child, PageTitle));
	const pageActionBar = childrenArray.find((child) => isOfType(child, PageActionBar));
	const pageContent = childrenArray.filter(
		(child) => !isOfType(child, PageTitle) && !isOfType(child, PageActionBar),
	);

	const pageHeader = (
		<div className='flex items-center justify-between gap-2'>
			<div className='min-w-0 shrink'>{pageTitle ?? <div />}</div>
			<div className='shrink-0'>{pageActionBar}</div>
		</div>
	);

	return (
		<PageProvider
			entity={entity}
			form={form}
			pageId={pageId}
		>
			<div
				className={cn('m-4', restProps.className)}
				{...restProps}
			>
				{form ? (
					<form>{pageContent}</form>
				) : (
					<div className='space-y-4'>
						{pageHeader}
						{pageContent}
					</div>
				)}
			</div>
		</PageProvider>
	);
}

export function PageTitle({ children }: { children: React.ReactNode }) {
	return <h1 className='text-2xl font-semibold font-heading'>{children}</h1>;
}

type InlineActionBarMenuItem = Omit<ActionBarMenuItem, 'type' | 'pageId'>;
interface PageActionBarProps {
	children: React.ReactNode;
	menuItems?: InlineActionBarMenuItem[];
}
export function PageActionBar({ children, menuItems }: PageActionBarProps) {
	const isMobile = useIsMobile();
	const pageContext = usePage('PageActionBar');
	const childArray = React.Children.toArray(children);
	const actionItems = childArray.filter((child) => isPageActionBarItem(child));
	const directChildren = childArray.filter((child) => !isPageActionBarItem(child));
	let actionsItemsToRender = actionItems;

	if (isMobile && actionItems.length > 1) {
		// on mobile screens, render only the last action item
		actionsItemsToRender = [
			actionItems[actionItems.length - 1],
		];
	}

	const actionBarMenuItems = menuItems?.map(
		(item) =>
			({
				...item,
				type: 'dropdown',
				pageId: pageContext.pageId,
			}) satisfies ActionBarMenuItem,
	);

	return (
		<div className='flex justify-end gap-2'>
			{/* Hide direct children on mobile */}
			{!isMobile &&
				directChildren.map((child, index) => <React.Fragment key={index}>{child}</React.Fragment>)}

			{/* Render action items */}
			{actionsItemsToRender.map((item, index) =>
				React.cloneElement(item, {
					key: `action-${index}`,
				}),
			)}

			{/* Dropdown menu */}
			{actionBarMenuItems && actionBarMenuItems.length > 0 && (
				<PageActionBarDropdownMenu
					items={actionBarMenuItems}
					pageContext={pageContext}
				/>
			)}
		</div>
	);
}

export interface ActionBarItemProps {
	children: React.ReactNode;
	id: string;
	requiredPermissions?: string[];
}

export function PageActionBarItem({ children, requiredPermissions }: ActionBarItemProps) {
	const content = requiredPermissions ? <>Require Permissions</> : children;

	return <>{content}</>;
}

export interface ActionBarMenuItem {
	pageId: string;
	component: React.FunctionComponent<{
		pageContext: PageContextProps;
	}>;
	type?: 'button' | 'dropdown';
	requiredPermissions?: string[];
	id?: string;
}

interface PageActionBarDropdownMenuProps {
	items: ActionBarMenuItem[];
	pageContext: PageContextProps;
}

function PageActionBarDropdownMenu({ items, pageContext }: PageActionBarDropdownMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='noShadow'
					size='icon'
				>
					<EllipsisVerticalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{items.map((item, index) => (
					<item.component
						key={item.pageId + index}
						pageContext={pageContext}
					/>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// UTILS //

export function isOfType(el: unknown, type: React.FunctionComponent<any>): boolean {
	if (React.isValidElement(el)) {
		const elTypeName = typeof el.type === 'string' ? el.type : (el.type as React.FunctionComponent).name;
		return elTypeName === type.name;
	}
	return false;
}

function isPageActionBarItem(child: unknown): child is React.ReactElement<ActionBarItemProps> {
	return React.isValidElement(child) && isOfType(child, PageActionBarItem);
}
