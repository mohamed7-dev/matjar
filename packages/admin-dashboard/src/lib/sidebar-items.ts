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
						'platform_catalog_read',
					],
				},
				{
					id: 'assets',
					title: /* i18n*/ 'Assets',
					path: '/assets',
					order: 500,
					requiredPermissions: [
						'platform_assets_read',
						'platform_catalog_read',
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
					id: 'marketplaceRegions',
					title: /* i18n*/ 'Marketplace Regions',
					path: '/marketplace-regions',
					order: 200,
					requiredPermissions: [
						'platform_marketplace_region_read',
					],
				},
				{
                        id: 'administrators',
                        title: /* i18n*/ 'Administrators',
                        path: '/administrators',
                        order: 300,
                        requiredPermissions: ['platform_administrator_create'],
                    },
						{
							id: 'roles',
							title: /* i18n*/ 'Roles',
							path: '/roles',
							order: 400,
							requiredPermissions: ['platform_administrator_read',"platform_role_create"],
						},
			],
		},
	],
};
