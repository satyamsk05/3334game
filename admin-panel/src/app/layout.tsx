import React from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { AdminGuard } from '@/components/layout/AdminGuard';

export const metadata = {
  title: '3334Game — Authoritative Admin Portal',
  description: 'Protected Admin Dashboard for 3334Game Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-blue-500/20 selection:text-blue-300">
        <AdminGuard>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AdminGuard>
      </body>
    </html>
  );
}
