import { useLingui } from '@lingui/react';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	useSidebar,
} from '@matjar/design-system/components/sidebar';
import { useRouter, useRouterState } from '@tanstack/react-router';
import React from 'react';
import type {
	SidebarNavItemPosition,
	SidebarNavMenuItem,
	SidebarNavMenuSection,
} from '@/lib/sidebar-items.js';
import { renderNavMenuSection } from './render-nav-menu-section.js';

type SortNavItemInput = {
	order?: number;
	title: string;
};

/**
 * Escapes special regex characters in a string to be used as a literal pattern
 */
function escapeRegexChars(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function NavMenu({ navItems }: { navItems: Array<SidebarNavMenuSection | SidebarNavMenuItem> }) {
	const { i18n } = useLingui();
	const router = useRouter();
	const routerState = useRouterState();

	const basePath = router.basepath || '';
	const currentPath = routerState.location.pathname;

	const { state: sidebarState, isMobile } = useSidebar();
	const isSidebarCollapsed = sidebarState === 'collapsed' && !isMobile;

	// Initialize state with active sections on mount
	const [openBottomSectionId, setOpenBottomSectionId] = React.useState<string | null>(null);

	const [openTopSectionIds, setOpenTopSectionIds] = React.useState<Set<string>>(new Set());

	// Handle top section open/close (only one section open at a time)
	const handleTopSectionToggle = (sectionId: string, isOpen: boolean) => {
		if (isOpen) {
			// When opening a section, close all others
			setOpenTopSectionIds(
				new Set([
					sectionId,
				]),
			);
		} else {
			// When closing a section, remove it from the set
			setOpenTopSectionIds(new Set());
		}
	};

	const handleBottomSectionToggle = (sectionId: string, isOpen: boolean) => {
		if (isOpen) {
			setOpenBottomSectionId(sectionId);
		} else if (openBottomSectionId === sectionId) {
			setOpenBottomSectionId(null);
		}
	};

	const isPathActive = React.useCallback(
		(itemUrl: string) => {
			// Remove basepath prefix from current path for comparison
			const normalizedCurrentPath = basePath
				? currentPath.replace(new RegExp(`^${escapeRegexChars(basePath)}`), '')
				: currentPath;

			// Ensure normalized path starts with /
			const cleanPath = normalizedCurrentPath.startsWith('/')
				? normalizedCurrentPath
				: `/${normalizedCurrentPath}`;

			console.log({
				cleanPath,
				itemUrl,
			});

			// Special handling for root path
			if (itemUrl === '/') {
				return cleanPath === '/' || cleanPath === '';
			}

			// For other paths, check exact match or prefix match
			return cleanPath === itemUrl || cleanPath.startsWith(`${itemUrl}/`);
		},
		[
			currentPath,
			basePath,
		],
	);

	const sortNavItems = React.useCallback((itemA: SortNavItemInput, itemB: SortNavItemInput) => {
		const orderA = itemA.order ?? Number.MAX_SAFE_INTEGER;
		const orderB = itemB.order ?? Number.MAX_SAFE_INTEGER;
		if (orderA === orderB) {
			return itemA.title.localeCompare(itemB.title);
		}
		return orderA - orderB;
	}, []);

	const getSortedSections = React.useCallback(
		(position: SidebarNavItemPosition) => {
			const positionedItems = navItems.filter((item) => item.position === position);
			const sortedSections = positionedItems
				.slice()
				.sort(sortNavItems)
				.map((section) => {
					if ('children' in section) {
						// sort nested nav items
						// TODO: check each item of the section.children for requiredPermissions
						const sortedChildren = (section.children ?? []).sort(sortNavItems);
						return {
							...section,
							children: sortedChildren,
						};
					}
					return section;
				});

			const nonEmptySections = sortedSections.filter((section) => {
				if ('children' in section) {
					return section.children && section.children.length > 0;
				}
				// check single item for requiredPermissions
				return section;
			});

			return nonEmptySections;
		},
		[
			navItems,
			sortNavItems,
		],
	);
	const topSections = React.useMemo(
		() => getSortedSections('top'),
		[
			getSortedSections,
		],
	);
	const bottomSections = React.useMemo(
		() => getSortedSections('bottom'),
		[
			getSortedSections,
		],
	);

	return (
		<React.Fragment>
			<SidebarGroup>
				<SidebarMenu>
					{topSections.map((item) =>
						renderNavMenuSection(
							item,
							isPathActive,
							isSidebarCollapsed,
							openTopSectionIds.has(item.id),
							handleTopSectionToggle,
							i18n,
						),
					)}
				</SidebarMenu>
			</SidebarGroup>
			{bottomSections.length ? (
				<SidebarGroup className='mt-auto'>
					<SidebarGroupLabel>Administration</SidebarGroupLabel>
					<SidebarMenu>
						{bottomSections.map((section) =>
							renderNavMenuSection(
								section,
								isPathActive,
								isSidebarCollapsed,
								openBottomSectionId === section.id,
								handleBottomSectionToggle,
								i18n,
							),
						)}
					</SidebarMenu>
				</SidebarGroup>
			) : null}
		</React.Fragment>
	);
}
