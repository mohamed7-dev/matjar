import { HoverCard, HoverCardContent, HoverCardTrigger } from '@matjar/design-system/components/hover-card';
import { Separator } from '@matjar/design-system/components/separator';
import { SidebarMenuButton } from '@matjar/design-system/components/sidebar';
import { cn } from '@matjar/design-system/lib/utils';
import { Link } from '@tanstack/react-router';
import type { SidebarNavMenuSection } from '@/lib/sidebar-items.js';

export function CollapsedNavMenuSection({
	item,
	isPathActive,
}: Readonly<{
	item: SidebarNavMenuSection;
	isPathActive: boolean;
}>) {
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<SidebarMenuButton isActive={isPathActive}>
					{item.icon && <item.icon />}
					<span>{item.title}</span>
				</SidebarMenuButton>
			</HoverCardTrigger>
			<HoverCardContent
				side='right'
				align='start'
				sideOffset={5}
				className='w-auto min-w-[8rem] p-1 space-y-1'
			>
				<p
					className='px-2 py-1.5 text-sm font-bold'
					data-testid='sidebar-hover-title'
				>
					{item.title}
				</p>
				<Separator />
				{item.children?.map((subItem) => (
					<Link
						key={subItem.id}
						to={subItem.path}
						className={cn(
							'flex items-center rounded-sm px-2 py-1.5 text-sm border-transparent border-2 hover:border-border focus-visible:ring-2 focus-visible:ring-ring',
							isPathActive && 'border-border',
						)}
					>
						{subItem.title}
					</Link>
				))}
			</HoverCardContent>
		</HoverCard>
	);
}
