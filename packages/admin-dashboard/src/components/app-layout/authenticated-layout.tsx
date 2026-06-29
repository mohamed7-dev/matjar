import { SidebarInset, SidebarProvider } from '@matjar/design-system/components/sidebar';
import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar.js';
import { Toolbar } from './toolbar.js';

export function AuthenticatedLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<div className='space-y-2'>
					<Toolbar />
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
