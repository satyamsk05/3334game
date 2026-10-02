import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { AdminGuard } from '@/components/layout/AdminGuard';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Bit Arcade Game — Authoritative Admin Portal',
  description: 'Protected Admin Dashboard for Bit Arcade Game Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} bg-surface-base text-text-primary min-h-screen antialiased selection:bg-accent-primary/20 selection:text-accent-primary font-sans transition-colors duration-150`}>
        <ThemeProvider>
          <AdminGuard>
            <AppShell>
              {children}
            </AppShell>
          </AdminGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
