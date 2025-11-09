'use client';

import { useLanguage } from '@/hooks/use-language';
import LanguageSelector from './language-selector';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  // ambil data user
  const userName = session?.user?.name ?? 'Guest';
  const roleVal = (session?.user as unknown as { role?: string })?.role;
  const userRole = typeof roleVal === 'string' ? roleVal : 'guest';

  return (
    <header className='bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 sm:h-20'>
          
          {/* 🖼️ Logo dan Judul */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='relative'>
              <Image
                src='/logo.svg'
                alt='Photo Booth Logo'
                width={40}
                height={40}
                className='h-8 w-8 sm:h-10 sm:w-10'
                priority
              />
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
                {t.title ?? 'Photo Booth'}
              </h1>
              <p className='text-xs sm:text-sm text-white/80 hidden sm:block'>
                {t.description ?? 'Capture memories with style'}
              </p>
            </div>
          </Link>

          {/* 🌐 Bagian kanan header */}
          <div className='flex items-center space-x-4'>
            {/* Language Selector */}
            <LanguageSelector />

            {/* User Info */}
            <div className='flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm'>
              <span className='text-sm font-medium'>{userName}</span>
              {userRole === 'admin' && (
                <span className='text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-md'>
                  Super Admin
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
