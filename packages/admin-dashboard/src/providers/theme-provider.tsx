import React from 'react';
import { createContext } from '@/lib/create-context.js';
import { useUserSettings } from './user-settings-provider.js';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContext {
	state: {
		theme: Theme;
	};
	actions: {
		setTheme: (theme: Theme) => void;
	};
}

const [ThemeContextProvider, useTheme] = createContext<ThemeContext>('ThemeContext', {
	state: {
		theme: 'system',
	},
	actions: {
		setTheme: () => null,
	},
});

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

export function ThemeProvider(props: ThemeProviderProps) {
	const { defaultTheme = 'system', children, ...restProps } = props;

	const {
		state: { settings },
		actions: { setTheme },
	} = useUserSettings('ThemeProvider');

	React.useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove('light', 'dark');

		const activeTheme =
			defaultTheme !== 'system' && settings.theme === 'system' ? defaultTheme : settings.theme;

		if (activeTheme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(activeTheme);
	}, [
		settings.theme,
		defaultTheme,
	]);

	const contextValue = React.useMemo(() => {
		return {
			state: {
				theme: settings.theme,
			},
			actions: {
				setTheme: setTheme,
			},
		} satisfies ThemeContext;
	}, [
		setTheme,
		settings.theme,
	]);

	return (
		<ThemeContextProvider
			{...restProps}
			{...contextValue}
		>
			{children}
		</ThemeContextProvider>
	);
}

export { useTheme };
