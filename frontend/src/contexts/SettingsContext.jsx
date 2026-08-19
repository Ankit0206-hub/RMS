import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const SettingsContext = createContext({
    settings: null,
    isLoading: true,
    error: null,
    refreshSettings: () => {}
});

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/public/settings');
            if (res.data && res.data.data) {
                setSettings(res.data.data);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch settings", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, isLoading, error, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
