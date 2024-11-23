'use client';

import Navbar from '@/components/Navbar.jsx';


export default function RootLayout({ children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body>
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
          <Navbar />
          <div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
