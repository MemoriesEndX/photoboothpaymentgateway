// components/PhotoGrid.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import PhotoModal from './PhotoModal';

type Photo = {
  id: number;
  filename: string;
  url: string;
  createdAt: string;
  metadata?: any;
  type: 'photo' | 'singlePhoto' | 'stripPhotoOriginal';
};

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div
            key={`${p.type}-${p.id}`}
            className="bg-white rounded shadow overflow-hidden relative cursor-pointer"
            onClick={() => setSelected(p)}
          >
            <div className="relative w-full h-40">
              <Image src={p.url} alt={p.filename} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className="p-2 text-xs text-gray-600 truncate">{p.filename}</div>
            <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded">
              {p.type}
            </div>
          </div>
        ))}
      </div>

      <PhotoModal photo={selected} onClose={() => setSelected(null)} />
    </>
  );
}
