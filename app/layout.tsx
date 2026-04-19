import { Suspense, type ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import type { Viewport } from 'next';
import { DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import { metadata as siteMetadata } from '@/config/site';
import './globals.css';

const serif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ew-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ew-mono',
});

export const metadata = siteMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070A12',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
