import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	useSidebar,
} from '@matjar/design-system/components/sidebar';
import { useRouter, useRouterState } from '@tanstack/react-router';
import React from 'react';
import { usePermissions } from '@/hooks/use-permissions.js';
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

export function NavMenu({ navItems }: { navItems: Array<SidebarNavMenuSection | SidebarNavMenuItem> }) {
	const { i18n } = useLingui();
	const { hasPermissions } = usePermissions();

	const router = useRouter();
	const routerState = useRouterState();

	const basePath = router.basepath || '';
	const currentPath = routerState.location.pathname;

	const { state: sidebarState, isMobile } = useSidebar();
	const isSidebarCollapsed = sidebarState === 'collapsed' && !isMobile;

	const isPathActive = React.useCallback(
		(itemPath: string) => {
			// Remove the prefix from the current path
			const currentPathWithNoBase = basePath
				? currentPath.replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '')
				: currentPath;

			// Current path must start with /
			const normalizedPath = currentPathWithNoBase.startsWith('/')
				? currentPathWithNoBase
				: `/${currentPathWithNoBase}`;

			// Root path: should match both / and empty path
			if (itemPath === '/') {
				return normalizedPath === '/' || normalizedPath === '';
			}

			// Any other path: exact match or prefix match
			return normalizedPath === itemPath || normalizedPath.startsWith(`${itemPath}/`);
		},
		[
			currentPath,
			basePath,
		],
	);

	// Initialize state with active sections on mount
	const initializeActiveSections = React.useCallback(
		(itemsOrSections: Array<SidebarNavMenuSection | SidebarNavMenuItem>) => {
			const activeTopSections = new Set<string>();
			let activeBottomSection: string | null = null;

			for (const itemOrSection of itemsOrSections) {
				if ('children' in itemOrSection && itemOrSection.children) {
					const section = itemOrSection;
					const sectionHasActiveItem = section.children.some((item) => isPathActive(item.path));

					if (sectionHasActiveItem) {
						if (section.position === 'top') {
							activeTopSections.add(section.id);
						} else if (section.position === 'bottom' && !activeBottomSection) {
							activeBottomSection = section.id;
						}
					}
				}
			}

			return {
				activeTopSections,
				activeBottomSection,
			};
		},
		[
			isPathActive,
		],
	);

	const [openBottomSectionId, setOpenBottomSectionId] = React.useState<string | null>(() => {
		const { activeBottomSection } = initializeActiveSections(navItems);
		return activeBottomSection;
	});

	const [openTopSectionIds, setOpenTopSectionIds] = React.useState<Set<string>>(() => {
		const { activeTopSections } = initializeActiveSections(navItems);
		return activeTopSections;
	});

	const handleTopSectionToggle = (sectionId: string, isOpen: boolean) => {
		// only one section open at a time
		if (isOpen) {
			setOpenTopSectionIds(
				new Set([
					sectionId,
				]),
			);
		} else {
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

	const sortNavItems = React.useCallback((itemA: SortNavItemInput, itemB: SortNavItemInput) => {
		const orderA = itemA.order ?? Number.MAX_SAFE_INTEGER;
		const orderB = itemB.order ?? Number.MAX_SAFE_INTEGER;
		if (orderA === orderB) {
			return itemA.title.localeCompare(itemB.title);
		}
		return orderA - orderB;
	}, []);

	const isItemViewable = React.useCallback(
		(navItem: SidebarNavMenuItem) => {
			if (!navItem.requiredPermissions) return true;
			return hasPermissions(navItem.requiredPermissions);
		},
		[
			hasPermissions,
		],
	);

	const getSortedSections = React.useCallback(
		(position: SidebarNavItemPosition) => {
			const positionedItems = navItems.filter((item) => item.position === position);
			const sortedSections = positionedItems
				.slice()
				.sort(sortNavItems)
				.map((section) => {
					if ('children' in section) {
						// check each child for requiredPermissions
						// sort nested nav items
						const sortedAllowedChildren = (section.children ?? [])
							.filter(isItemViewable)
							.sort(sortNavItems);
						return {
							...section,
							children: sortedAllowedChildren,
						};
					}
					return section;
				});

			const nonEmptySections = sortedSections.filter((section) => {
				// this filters out sections with no children
				if ('children' in section) {
					return section.children && section.children.length > 0;
				}
				// check single item for requiredPermissions
				return isItemViewable(section as SidebarNavMenuItem);
			});

			return nonEmptySections;
		},
		[
			navItems,
			sortNavItems,
			isItemViewable,
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
						renderNavMenuSection({
							item,
							isPathActive,
							isSidebarCollapsed,
							isOpen: openTopSectionIds.has(item.id),
							onToggle: handleTopSectionToggle,
							i18n,
						}),
					)}
				</SidebarMenu>
			</SidebarGroup>
			{bottomSections.length ? (
				<SidebarGroup className='mt-auto'>
					<SidebarGroupLabel>
						<Trans>Administration</Trans>
					</SidebarGroupLabel>
					<SidebarMenu>
						{bottomSections.map((section) =>
							renderNavMenuSection({
								item: section,
								isPathActive,
								isSidebarCollapsed,
								isOpen: openBottomSectionId === section.id,
								onToggle: handleBottomSectionToggle,
								i18n,
							}),
						)}
					</SidebarMenu>
				</SidebarGroup>
			) : null}
		</React.Fragment>
	);
}
