
"use client";

import type { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HtmlWrapperProps {
  children: ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}

export function HtmlWrapper({ children, geistSansVariable, geistMonoVariable }: HtmlWrapperProps) {
  const { language } = useLanguage();
  return (
    <html lang={language} className={`${geistSansVariable} ${geistMonoVariable}`}>
      {children}
    </html>
  );
}
