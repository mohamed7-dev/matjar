import { ChartLineIcon, type LucideIcon, Settings2Icon, TagsIcon } from 'lucide-react';

export type SidebarNavItemPosition = 'top' | 'bottom';

export interface SidebarNavMenuItem {
	id: string;
	title: string;
	path: string;
	icon?: LucideIcon;
	order?: number;
	position?: SidebarNavItemPosition;
	requiredPermissions?: string[];
}

export interface SidebarNavMenuSection extends Omit<SidebarNavMenuItem, 'path'> {
	children: SidebarNavMenuItem[];
	open?: boolean;
}

interface SidebarNavMenuConfig {
	sections: Array<SidebarNavMenuItem | SidebarNavMenuSection>;
}

export const sidebarNavMenuItems: SidebarNavMenuConfig = {
	sections: [
		{
			id: 'insights',
			title: /* i18n*/ 'Insights',
			position: 'top',
			order: 100,
			path: '/',
			icon: ChartLineIcon,
		},
		{
			id: 'catalog',
			title: /* i18n*/ 'Catalog',
			icon: TagsIcon,
			position: 'top',
			order: 200,
			children: [
				{
					id: 'products',
					title: /* i18n*/ 'Products',
					path: '/products',
					order: 100,
					requiredPermissions: [
						'ReadProduct',
						'ReadCatalog',
					],
				},
				{
					id: 'assets',
					title: /* i18n*/ 'Assets',
					path: '/assets',
					order: 500,
					requiredPermissions: [
						'ReadAsset',
						'ReadCatalog',
					],
				},
			],
		},
		{
			id: 'settings',
			title: /* i18n*/ 'Settings',
			icon: Settings2Icon,
			position: 'bottom',
			order: 100,
			children: [
				{
					id: 'salesChannels',
					title: /* i18n*/ 'SalesChannels',
					path: '/sales-channels',
					order: 200,
					requiredPermissions: [
						'ReadChannel',
					],
				},
			],
		},
	],
};
