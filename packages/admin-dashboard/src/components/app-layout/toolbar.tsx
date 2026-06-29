import { Separator } from '@matjar/design-system/components/separator';
import { SidebarTrigger } from '@matjar/design-system/components/sidebar';

export function Toolbar() {
	return (
		<header className='h-16 flex items-center shrink-0 gap-2 bg-secondary-background border-b-2 border-border'>
			<div className='w-full flex items-center justify-between gap-2 px-4'>
				<div className='flex items-center justify-start gap-2 min-w-0'>
					<SidebarTrigger />
					<Separator
						orientation='vertical'
						className='me-2 shrink-0'
					/>
					<p>breadcrumbs</p>
				</div>
				<div className='flex items-center justify-end gap-2 shrink-0'>{/* <TopBarItems /> */}</div>
			</div>
		</header>
	);
}
