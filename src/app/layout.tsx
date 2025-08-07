import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CraftConnect - Handwerker-Vermittlungsplattform',
  description: 'Finden Sie qualifizierte Handwerker oder bieten Sie Ihre Dienstleistungen an. Die führende Plattform für Handwerker-Vermittlung in Deutschland.',
  keywords: 'Handwerker, Vermittlung, Dienstleistungen, Handwerk, Aufträge, Bewerbungen',
  authors: [{ name: 'CraftConnect Team' }],
  openGraph: {
    title: 'CraftConnect - Handwerker-Vermittlungsplattform',
    description: 'Finden Sie qualifizierte Handwerker oder bieten Sie Ihre Dienstleistungen an.',
    url: 'https://craftconnect.de',
    siteName: 'CraftConnect',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CraftConnect - Handwerker-Vermittlungsplattform',
    description: 'Finden Sie qualifizierte Handwerker oder bieten Sie Ihre Dienstleistungen an.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
