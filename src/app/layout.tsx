
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { HtmlWrapper } from '@/components/layout/HtmlWrapper'; // Import the new component

export async function generateMetadata(): Promise<Metadata> {
  const defaultDescription = translations.en.appDescription as string;
  return {
    title: 'LIBRTOD',
    description: defaultDescription,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#191D23' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <HtmlWrapper geistSansVariable={GeistSans.variable} geistMonoVariable={GeistMono.variable}>
        <body className={`font-sans antialiased`}>
          {children}
          <Toaster />
        </body>
      </HtmlWrapper>
    </LanguageProvider>
  );
}
