'use client';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <NotificationProvider>
          {children}
          <Toaster
            richColors
            position="top-center"
            expand={true}
            toastOptions={{
              style: {
                background: 'var(--background)',
                fontSize: '1.2rem',
                padding: '1rem',
                minWidth: '400px',
                border: '2px solid var(--primary)',
              },
              duration: 5000,
            }}
          />
        </NotificationProvider>
      </body>
    </html>
  );
}
