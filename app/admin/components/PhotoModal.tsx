// components/PhotoModal.tsx
'use client';

import Image from 'next/image';
import { Fragment } from 'react';

type Photo = {
  id: number;
  filename: string;
  url: string;
  createdAt: string;
  metadata?: any;
  type: string;
} | null;

export default function PhotoModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  if (!photo) return null;

  const handleDownload = async () => {
    try {
      const resp = await fetch(photo.url);
      const blob = await resp.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('download err', err);
      alert('Gagal mengunduh foto');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-lg truncate">{photo.filename}</h3>
            <div className="text-xs text-gray-500">{new Date(photo.createdAt).toLocaleString()}</div>
          </div>
          <div className="space-x-2">
            <button onClick={handleDownload} className="px-3 py-1 bg-slate-100 rounded">Download</button>
            <button onClick={onClose} className="px-3 py-1 bg-red-500 text-white rounded">Close</button>
          </div>
        </div>

        <div className="p-4 flex justify-center">
          <div className="w-full max-h-[70vh]">
            <Image src={photo.url} alt={photo.filename} width={1600} height={900} style={{ objectFit: 'contain' }} />
          </div>
        </div>

        <div className="p-4 text-sm text-gray-600 border-t">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(photo.metadata || {}, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
