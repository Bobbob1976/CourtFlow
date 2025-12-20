"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary, Locale } from '@/lib/i18n/dictionary';

type LanguageContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: typeof dictionary.nl;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('nl');

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem('courtflow_lang') as Locale;
        if (saved && (saved === 'nl' || saved === 'en')) {
            setLocale(saved);
        }
    }, []);

    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('courtflow_lang', newLocale);
    };

    const value = {
        locale,
        setLocale: changeLocale,
        t: dictionary[locale],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
