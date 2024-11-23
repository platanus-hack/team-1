'use client';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
