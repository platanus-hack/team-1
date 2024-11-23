'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationsMenu } from './NotificationsMenu';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full bg-transparent text-black">
      <div className="container mx-auto px-4 flex justify-between items-center h-14">
        <h1
          className="text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/home')}
        >
          Get Human Talking
        </h1>

        <div className="flex items-center gap-4">
          <NotificationsMenu />
          <div
            className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => router.push('/profile')}
          >
            <div className="absolute inset-0 rounded-full border-2 border-black"></div>
            <User size={20} className="relative z-10 text-black" />
          </div>
        </div>
      </div>
    </nav>
  );
}
