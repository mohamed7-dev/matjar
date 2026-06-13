import React from 'react';
import { createContext } from '@/lib/create-context.js';

export interface PageContextProps {
	entity?: any;
	form?: any;
	pageId: string;
}

const [PageContextProvider, usePage] = createContext<PageContextProps>('PageContext', undefined);

interface PageProviderProps extends PageContextProps {
	children: React.ReactNode;
}

export function PageProvider({ children, entity, form, pageId }: PageProviderProps) {
	const contextValue = React.useMemo(() => {
		return {
			entity,
			form,
			pageId,
		};
	}, [
		entity,
		form,
		pageId,
	]);
	return <PageContextProvider {...contextValue}>{children}</PageContextProvider>;
}

export { usePage };
