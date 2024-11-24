'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NotificationsMenu } from './NotificationsMenu';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full bg-transparent text-black">
      <div className="container mx-auto px-4 flex justify-between items-center h-14">
        <div
          className="cursor-pointer"
          onClick={() => router.push('/home')}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

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
