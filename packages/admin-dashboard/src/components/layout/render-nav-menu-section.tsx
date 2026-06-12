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
	isPathActive: boolean,
	isSidebarCollapsed: boolean,
	isOpen: boolean,
	onToggle: (id: string, isOpen: boolean) => void,
) {
	if ('path' in item) {
		return (
			<SidebarMenuItem key={item.id}>
				<SidebarMenuButton
					tooltip={item.title}
					// render={<Link to={item.url} />}
					isActive={isPathActive}
					asChild
				>
					<Link to={item.path}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
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
					<SidebarMenuButton tooltip={item.title}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
						<ChevronRightIcon className='ms-auto transition-transform duration-200 rtl:rotate-180 group-data-open/collapsible:rotate-90' />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.children.map((subItem) => (
							<SidebarMenuSubItem key={subItem.id}>
								<SidebarMenuSubButton
									// render={<Link to={subItem.url} />}
									isActive={isPathActive}
									asChild
								>
									<Link to={subItem.path}>
										<span>{subItem.title}</span>
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
