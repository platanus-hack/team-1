'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
