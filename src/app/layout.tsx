import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MyVipers - Fidelización inteligente para restaurantes',
    description: 'Plataforma SaaS de fidelización, reservas y carta digital para restaurantes. Puntos VIP, promociones y CRM.',
    manifest: '/manifest.json',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MyVipers' },
};

export const viewport: Viewport = {
    themeColor: '#0f0f1a',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" style={{ colorScheme: 'dark' }}>
            <body className={`${inter.className} bg-[#0f0f1a] text-white antialiased min-h-screen`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
