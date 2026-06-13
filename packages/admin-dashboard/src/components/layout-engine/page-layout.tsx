import { useIsMobile } from '@matjar/design-system/hooks/use-mobile';
import React from 'react';
import type { PageBlockProps } from './page-block.js';

type PageLayoutProps = {
	children: React.ReactNode;
	className?: string;
};

export function PageLayout({ children, className }: PageLayoutProps) {
	const isMobile = useIsMobile();

	// Normalize and extract PageBlock children
	const blocks: React.ReactElement<PageBlockProps>[] = [];

	React.Children.forEach(children, (child) => {
		// Direct PageBlock
		if (isPageBlock(child)) {
			blocks.push(child);
		}

		// Fragment support
		if (React.isValidElement(child) && child.type === React.Fragment) {
			React.Children.forEach((child as React.ReactElement<any>).props.children, (fragmentChild) => {
				if (isPageBlock(fragmentChild)) {
					blocks.push(fragmentChild);
				}
			});
		}
	});

	// Group blocks by column
	const fullWidthBlocks = blocks.filter((block) => block.props.column === 'full');

	const mainBlocks = blocks.filter((block) => block.props.column === 'main');

	const sideBlocks = blocks.filter((block) => block.props.column === 'side');

	return (
		<div className={className}>
			{isMobile ? (
				// Mobile: stack everything vertically
				<div className='space-y-4'>{blocks}</div>
			) : (
				// Desktop grid layout
				<div className='grid grid-cols-4 gap-4'>
					{/* Full width section */}
					{fullWidthBlocks.length > 0 && (
						<div className='col-span-4 space-y-4'>{fullWidthBlocks}</div>
					)}

					{/* Main content */}
					<div className='col-span-3 space-y-4'>{mainBlocks}</div>

					{/* Sidebar */}
					<div className='col-span-1 space-y-4'>{sideBlocks}</div>
				</div>
			)}
		</div>
	);
}

function isPageBlock(child: unknown): child is React.ReactElement<PageBlockProps> {
	return (
		React.isValidElement(child) &&
		'column' in (child as React.ReactElement<PageBlockProps>).props &&
		'id' in (child as React.ReactElement<PageBlockProps>).props
	);
}
