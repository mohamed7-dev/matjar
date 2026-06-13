import { Separator } from '@matjar/design-system/components/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@matjar/design-system/components/sidebar';
import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar.js';

export function AuthenticatedLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<div className='p-4'>
					<header className='h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-border border-b flex items-center shrink-0 gap-2 transition-[width,height] ease-linear'>
						<div className='w-full flex items-center justify-between gap-2 px-4'>
							<div className='flex items-center justify-start gap-2 min-w-0'>
								<SidebarTrigger />
								<Separator
									orientation='vertical'
									className='mr-2 shrink-0'
								/>
								<p>breadcrumbs</p>
							</div>
							<div className='flex items-center justify-end gap-2 shrink-0'>
								{/* <TopBarItems /> */}
							</div>
						</div>
					</header>
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
