import { StorageService } from '@/services/storage';
import { AppSettings } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type SettingsContextType = {
    settings: AppSettings;
    updateSettings: (newSettings: AppSettings) => Promise<void>;
    isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>({
        defaultWaste: '10',
        defaultUnit: 'ft',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const saved = await StorageService.getSettings();
            setSettings(saved);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: AppSettings) => {
        setSettings(newSettings);
        await StorageService.saveSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
