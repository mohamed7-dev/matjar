import type React from 'react';
import { createContext } from '@/lib/create-context.js';
import type { PageBlockProps } from './page-block.js';

export type PageBlockContextProps = Pick<PageBlockProps, 'id' | 'column' | 'title' | 'description'>;

const [PageBlockContextProvider, usePageBlock] = createContext<PageBlockContextProps>(
	'PageBlockContext',
	undefined,
);

interface PageBlockProviderProps extends PageBlockContextProps {
	children: React.ReactNode;
}

export function PageBlockProvider({ children, ...contextValue }: PageBlockProviderProps) {
	return <PageBlockContextProvider {...contextValue}>{children}</PageBlockContextProvider>;
}

export { usePageBlock };
