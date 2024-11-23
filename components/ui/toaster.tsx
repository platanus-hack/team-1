'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors
      style={{
        fontSize: '1.2rem',
      }}
      toastOptions={{
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          padding: '1rem',
          minWidth: '400px',
        },
      }}
    />
  );
}
