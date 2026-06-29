import { useLingui } from '@lingui/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@matjar/design-system/components/hover-card';
import { Separator } from '@matjar/design-system/components/separator';
import { SidebarMenuButton } from '@matjar/design-system/components/sidebar';
import { cn } from '@matjar/design-system/lib/utils';
import { Link } from '@tanstack/react-router';
import type { SidebarNavMenuSection } from '@/lib/sidebar-items.js';

interface CollapsedNavMenuSectionProps {
	item: SidebarNavMenuSection;
	isPathActive: (path: string) => boolean;
}

export function CollapsedNavMenuSection({ item, isPathActive }: CollapsedNavMenuSectionProps) {
	const { i18n } = useLingui();
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<SidebarMenuButton isActive={item.children?.some((subItem) => isPathActive(subItem.path))}>
					{item.icon && <item.icon />}
					<span>{i18n.t(item.title)}</span>
				</SidebarMenuButton>
			</HoverCardTrigger>
			<HoverCardContent
				side='right'
				align='start'
				sideOffset={7}
				className='w-auto min-w-[8rem] p-1 space-y-1'
			>
				<p
					className='px-2 py-1.5 text-base font-heading'
					data-testid='sidebar-hover-title'
				>
					{i18n.t(item.title)}
				</p>
				<Separator />
				{item.children?.map((subItem) => (
					<Link
						key={subItem.id}
						to={subItem.path}
						className={cn(
							'flex items-center rounded-base px-2 py-1.5 text-sm border-transparent border-2 hover:border-border focus-visible:ring-2 focus-visible:ring-ring',
							isPathActive(subItem.path) && 'border-border',
						)}
					>
						{i18n.t(subItem.title)}
					</Link>
				))}
			</HoverCardContent>
		</HoverCard>
	);
}
