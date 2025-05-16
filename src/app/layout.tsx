import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

export const metadata: Metadata = {
  title: 'LIBRTOD', // Updated title
  description: 'Identify products and get detailed descriptions with LIBRTOD.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`font-sans antialiased`}> {/* Use font-sans which refers to --font-geist-sans */}
        {children}
        <Toaster /> {/* Added Toaster */}
      </body>
    </html>
  );
}
