import type { I18n } from '@lingui/core';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@matjar/design-system/components/collapsible';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@matjar/design-system/components/sidebar';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import type { SidebarNavMenuItem, SidebarNavMenuSection } from '@/lib/sidebar-items.js';
import { CollapsedNavMenuSection } from './collapsed-nav-menu-section.js';

export function renderNavMenuSection(
	item: SidebarNavMenuItem | SidebarNavMenuSection,
	isPathActive: (path: string) => boolean,
	isSidebarCollapsed: boolean,
	isOpen: boolean,
	onToggle: (id: string, isOpen: boolean) => void,
	i18n: I18n,
) {
	if ('path' in item) {
		return (
			<SidebarMenuItem key={item.id}>
				<SidebarMenuButton
					tooltip={i18n.t(item.title)}
					// render={<Link to={item.url} />}
					isActive={isPathActive(item.path)}
					asChild
				>
					<Link to={item.path}>
						{item.icon && <item.icon />}
						<span>{i18n.t(item.title)}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	if (isSidebarCollapsed) {
		return (
			<SidebarMenuItem key={item.id}>
				<CollapsedNavMenuSection
					item={item}
					isPathActive={isPathActive}
				/>
			</SidebarMenuItem>
		);
	}

	return (
		<Collapsible
			key={item.id}
			open={isOpen}
			onOpenChange={(open) => onToggle(item.id, open)}
			className='group/collapsible'
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton tooltip={i18n.t(item.title)}>
						{item.icon && <item.icon />}
						<span>{i18n.t(item.title)}</span>
						<ChevronRightIcon className='ms-auto transition-transform duration-200 rtl:rotate-180 group-data-open/collapsible:rotate-90' />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.children.map((subItem) => (
							<SidebarMenuSubItem key={subItem.id}>
								<SidebarMenuSubButton
									// render={<Link to={subItem.url} />}
									isActive={isPathActive(subItem.path)}
									asChild
								>
									<Link to={subItem.path}>
										<span>{i18n.t(subItem.title)}</span>
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}
