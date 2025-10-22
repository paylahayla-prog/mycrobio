import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache translations to avoid re-fetching
const translationsCache: { [key in Language]?: Record<string, string> } = {};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('microbeMapLanguage');
        return (savedLang === 'en' || savedLang === 'fr') ? savedLang : 'en';
    });
    
    const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadTranslations = async () => {
            if (translationsCache[language]) {
                setCurrentTranslations(translationsCache[language]!);
                return;
            }

            try {
                // Using absolute path from web root
                const response = await fetch(`/i18n/${language}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                translationsCache[language] = data;
                setCurrentTranslations(data);
            } catch (error) {
                console.error(`Could not load translation file for ${language}:`, error);
                // Fallback to empty to avoid crash, keys will be shown
                setCurrentTranslations({});
            }
        };

        loadTranslations();
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
