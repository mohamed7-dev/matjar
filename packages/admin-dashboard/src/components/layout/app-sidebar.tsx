import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar,
} from '@matjar/design-system/components/sidebar';
import { cn } from '@matjar/design-system/lib/utils';
import { ShoppingBagIcon } from 'lucide-react';
import { sidebarNavMenuItems } from '@/lib/sidebar-items.js';

import { NavMenu } from './nav-menu.js';

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
					<div className='size-[34px] bg-primary border-2 border-primary flex items-center justify-center shrink-0'>
						<ShoppingBagIcon
							className='text-primary-foreground'
							size={18}
							strokeWidth={2.5}
						/>
					</div>
					{!collapsed && (
						<span className='text-primary text-lg font-bold whitespace-nowrap'>MATJAR</span>
					)}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMenu navItems={sidebarNavMenuItems.sections} />
			</SidebarContent>
			<SidebarFooter>{/* <SidebarUserNav /> */}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
