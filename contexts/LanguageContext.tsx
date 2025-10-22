import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import enData from '../i18n/en.json';
import frData from '../i18n/fr.json';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const ALL_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: enData as Record<string, string>,
  fr: frData as Record<string, string>,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('microbeMapLanguage');
        return (savedLang === 'en' || savedLang === 'fr') ? savedLang : 'en';
    });
    
    const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>(ALL_TRANSLATIONS[language]);

    useEffect(() => {
        setCurrentTranslations(ALL_TRANSLATIONS[language]);
    }, [language]);

    const setLanguage = (lang: Language) => {
        localStorage.setItem('microbeMapLanguage', lang);
        setLanguageState(lang);
    };

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        let translation = currentTranslations[key] || key;
        
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        return translation;
    }, [currentTranslations]);

    const contextValue = { language, setLanguage, t };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
