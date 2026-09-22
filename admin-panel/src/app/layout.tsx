import React from 'react';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { AdminGuard } from '@/components/layout/AdminGuard';

export const metadata = {
  title: '3334Game — Authoritative Admin Portal',
  description: 'Protected Admin Dashboard for 3334Game Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-premation-base text-premation-textSecondary min-h-screen antialiased selection:bg-premation-accent/25 selection:text-white font-sans">
        <AdminGuard>
          <AppShell>
            {children}
          </AppShell>
        </AdminGuard>
      </body>
    </html>
  );
}
