import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { absoluteUrl } from '@/lib/utils/seo';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetBrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#0F0A0B',
  colorScheme: 'dark'
};

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl('/')),
  title: {
    default: 'BurgReport — Grand Cru Burgundy Pricing Intelligence',
    template: '%s | BurgReport'
  },
  description: 'Data-forward pricing intelligence for Burgundy Grand Cru climats. Search, compare, and evaluate market context with transparent source labels.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'BurgReport — Grand Cru Burgundy Pricing Intelligence',
    description: 'The clean, data-forward pricing terminal for Burgundy Grand Cru research.',
    url: absoluteUrl('/'),
    siteName: 'BurgReport',
    images: [{ url: absoluteUrl('/og.svg'), width: 1200, height: 630, alt: 'BurgReport pricing intelligence' }],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BurgReport — Grand Cru Burgundy Pricing Intelligence',
    description: 'Grand Cru Burgundy pricing intelligence for collectors, sommeliers, retailers, and investors.',
    images: [absoluteUrl('/og.svg')]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrains.variable}`}>
      <body className="font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
