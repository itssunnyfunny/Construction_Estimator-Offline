import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const PRO_STATUS_KEY = 'estimator_pro_status';

type ProContextType = {
    isPro: boolean;
    purchasePro: () => Promise<void>;
    restorePurchase: () => Promise<void>;
};

const ProContext = createContext<ProContextType>({
    isPro: false,
    purchasePro: async () => { },
    restorePurchase: async () => { },
});

export const usePro = () => useContext(ProContext);

export function ProProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        checkProStatus();
    }, []);

    const checkProStatus = async () => {
        try {
            const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
            setIsPro(status === 'true');
        } catch (e) {
            console.error('Failed to load pro status');
        }
    };

    const purchasePro = async () => {
        // Mock purchase
        try {
            await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
            setIsPro(true);
            Alert.alert('Success', 'Welcome to Pro!');
        } catch (e) {
            Alert.alert('Error', 'Purchase failed');
        }
    };

    const restorePurchase = async () => {
        // Mock restore
        await checkProStatus();
        if (await AsyncStorage.getItem(PRO_STATUS_KEY) === 'true') {
            Alert.alert('Restored', 'Pro features restored.');
        } else {
            Alert.alert('Restore', 'No purchase found.');
        }
    };

    return (
        <ProContext.Provider value={{ isPro, purchasePro, restorePurchase }}>
            {children}
        </ProContext.Provider>
    );
}
