import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar,
} from '@matjar/design-system/components/sidebar';
import { cn } from '@matjar/design-system/lib/utils';
import { sidebarNavMenuItems } from '@/lib/sidebar-items.js';
import { Logo } from '../shared/logo.js';
import { NavMenu } from './nav-menu.js';
import { UserNavMenu } from './user-nav-menu.js';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const collapsed = state === 'collapsed';
	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			<SidebarHeader>
				<div className={cn('flex items-center gap-2 p-4', collapsed && 'p-0')}>
					<Logo
						hideText={collapsed}
						size={collapsed ? 'sm' : 'default'}
					/>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMenu navItems={sidebarNavMenuItems.sections} />
			</SidebarContent>
			<SidebarFooter>
				<UserNavMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
