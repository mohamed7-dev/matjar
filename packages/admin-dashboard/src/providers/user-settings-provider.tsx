import React from 'react';
import { createContext } from '@/lib/create-context.js';
import { LOCAL_STORAGE_USER_SETTINGS_KEY } from '@/lib/keys.js';
import type { Theme } from './theme-provider.js';

type UserSettingsContext = {
	state: {
		settings: UserSettings;
	};
	actions: {
		setTheme: (theme: Theme) => void;
		setDisplayLanguage: (language: string) => void;
		setDisplayLocale: (locale: string | undefined) => void;
		setContentLanguage: (language: string) => void;
		setActiveMarketplaceRegionId: (marketplaceRegionId: string) => void;
	};
};

export interface UserSettings {
	theme: Theme;
	displayLanguage: string;
	displayLocale?: string;
	contentLanguage: string;
	activeMarketplaceRegionId: string;
}

const initialUserSettings: UserSettings = {
	theme: 'system',
	displayLanguage: 'en',
	displayLocale: undefined,
	contentLanguage: 'en',
	activeMarketplaceRegionId: '',
};

const [UserSettingsContextProvider, useUserSettings] = createContext<UserSettingsContext>(
	'UserSettingsContext',
	undefined,
);

interface UserSettingsProviderProps {
	children: React.ReactNode;
}
export function UserSettingsProvider({ children }: UserSettingsProviderProps) {
	const loadSettingsFromLocalStorage = React.useCallback(() => {
		try {
			const settingsFromLS = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
			if (settingsFromLS) {
				// merge
				return {
					...initialUserSettings,
					...JSON.parse(settingsFromLS),
				};
			}
		} catch (e) {
			console.error('Error while loading user settings from localStorage', e);
		}
		// return initial settings if nothing stored in the LS
		return {
			...initialUserSettings,
		};
	}, []);
	const [settings, setSettings] = React.useState<UserSettings>(loadSettingsFromLocalStorage);

	React.useEffect(() => {
		try {
			localStorage.setItem(LOCAL_STORAGE_USER_SETTINGS_KEY, JSON.stringify(settings));
		} catch (e) {
			console.error('Error while saving user settings to localStorage', e);
		}
	}, [
		settings,
	]);

	const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const contextValue: UserSettingsContext = {
		state: {
			settings,
		},
		actions: {
			setTheme: (theme: Theme) => updateSetting('theme', theme),
			setDisplayLanguage: (language) => updateSetting('displayLanguage', language),
			setDisplayLocale: (locale) => updateSetting('displayLocale', locale),
			setContentLanguage: (language) => updateSetting('contentLanguage', language),
			setActiveMarketplaceRegionId: (id: string) => updateSetting('activeMarketplaceRegionId', id),
		},
	};
	return <UserSettingsContextProvider {...contextValue}>{children}</UserSettingsContextProvider>;
}

export { useUserSettings };
