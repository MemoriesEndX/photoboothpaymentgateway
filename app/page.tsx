'use client';

import PhotoBooth from '@/components/photo-booth';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col items-center justify-start p-2 sm:p-4 bg-gradient-to-br from-[#ffffff] via-[#C8D1D2] to-[#4A8EDC] min-h-full">
      <div className="w-full max-w-4xl flex flex-col items-center text-center mt-6 sm:mt-10">
        
        {/* 🖼️ Gambar di atas teks (lebih besar & sedikit lebih ke bawah) */}
        <div className="mb-1 sm:mb-1"> {/* Jarak antar foto dan teks diperpendek */}
          <Image
            src="/Asset 240.png"
            alt="Memories End XYZ"
            width={360}
            height={360}
            className="object-contain drop-shadow-xl mx-auto"
            priority
          />
        </div>

        {/* 📝 Teks di bawah gambar */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-1 sm:mb-3 bg-gradient-to-r from-[#0F3C68] via-[#4A8EDC] to-[#8ebff8] bg-clip-text text-transparent px-2">
            {t.createMoment ?? 'Create Beautiful Moments'}
          </h1>
          <p className="text-center text-[#003468FF]/80 max-w-md text-sm sm:text-base px-4">
            {t.description ?? 'Abadikan setiap momen berharga dengan sentuhan modern.'}
          </p>
        </div>

        {/* 📸 Komponen utama */}
        <PhotoBooth />
      </div>
    </div>
  );
}
