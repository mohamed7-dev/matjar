import { Trans } from '@lingui/react/macro';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@matjar/design-system/components/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@matjar/design-system/components/sidebar';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/providers/auth-provider.js';
import type { Theme } from '@/providers/theme-provider.js';
import { useUserSettings } from '@/providers/user-settings-provider.js';

export function UserNavMenu() {
	const { logout, user } = useAuth('UserNavMenu');
	const {
		state: { settings },
		actions: { setTheme },
	} = useUserSettings('UserNavMenu');
	const router = useRouter();
	const navigate = useNavigate();
	const { isMobile, state } = useSidebar();
	const isSidebarExpanded = state === 'expanded';

	const handleLogout = React.useCallback(() => {
		logout().then(() => {
			router.invalidate().finally(() => {
				navigate({
					to: '/login',
				});
			});
		});
	}, [
		logout,
		navigate,
		router.invalidate,
	]);

	const avatar = React.useMemo(() => {
		return (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '');
	}, [
		user,
	]);

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size={'lg'}
							className='data-open:bg-primary data-open:text-primary-foreground'
						>
							<div className='size-8 relative flex justify-center items-center rounded-base border-2 border-border'>
								{avatar}
							</div>
							{isSidebarExpanded && (
								<div className='flex flex-col text-sm leading-wide'>
									<span className='truncate font-heading font-base text-foreground'>
										{user.firstName} {user.lastName}
									</span>
									<span className='truncate font-mono text-xs'>{user.identifier}</span>
								</div>
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={7}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className='p-0'>
								<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
									<div className='size-8 relative flex justify-center items-center rounded-base border-2 border-border'>
										{avatar}
									</div>
									<div className='flex flex-col text-sm leading-tight'>
										<span className='truncate font-heading font-base text-foreground'>
											{user.firstName} {user.lastName}
										</span>
										<span className='truncate font-mono text-xs'>{user.identifier}</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to='/profile'>
									<Trans>Profile</Trans>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<Trans>Theme</Trans>
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuRadioGroup
										value={settings.theme}
										onValueChange={(value) => setTheme(value as Theme)}
									>
										<DropdownMenuRadioItem value='light'>
											<SunIcon />
											<Trans context='theme'>Light</Trans>
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value='dark'>
											<MoonIcon />
											<Trans context='theme'>Dark</Trans>
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value='system'>
											<MonitorIcon />
											<Trans context='theme'>System</Trans>
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOutIcon />
							<Trans>Log out</Trans>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
