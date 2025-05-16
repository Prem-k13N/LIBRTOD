
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Translations, NestedTranslations } from '@/lib/translations';

export type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations | string, ...args: any[]) => string; // Allow string for nested keys
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const translate = useCallback((key: string, ...args: any[]): string => {
    const langTranslations = translations[language] as NestedTranslations;
    const keys = key.split('.');
    let current: string | Function | NestedTranslations | undefined = langTranslations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as NestedTranslations)[k];
      } else {
        // Fallback to English if key not found or not an object before final key
        const enTranslations = translations.en as NestedTranslations;
        current = enTranslations;
        for (const ek of keys) {
            if (current && typeof current === 'object' && ek in current) {
                current = (current as NestedTranslations)[ek];
            } else {
                return key; // Return key itself if not found in English either
            }
        }
        break;
      }
    }
    
    if (typeof current === 'function') {
      return current(...args);
    }
    if (typeof current === 'string') {
      return current;
    }
    // Fallback to English if key not found in current language
    // This part might be redundant if the above loop handles English fallback correctly
    const enTranslation = translations.en[key as keyof Translations];
    if (typeof enTranslation === 'function') {
      return enTranslation(...args);
    }
    if (typeof enTranslation === 'string') {
      return enTranslation;
    }
    return key; // Return the key itself if no translation is found
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
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
