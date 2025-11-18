// app/api/sessions/[sessionId]/photos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params;

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId required' }, { status: 400 });
  }

  try {
    // Cari di ketiga tabel semua entry dengan sessionId tersebut
    const [photos, singlePhotos, strips] = await Promise.all([
      prisma.photo.findMany({
        where: { sessionId },
        select: { id: true, filename: true, url: true, createdAt: true, metadata: true },
      }),
      prisma.singlePhoto.findMany({
        where: { sessionId },
        select: { id: true, filename: true, url: true, createdAt: true, metadata: true },
      }),
      prisma.stripPhotoOriginal.findMany({
        where: { sessionId },
        select: { id: true, filename: true, url: true, createdAt: true, metadata: true },
      }),
    ]);

    // Normalisasi dan beri tag tipe supaya frontend bisa menampilkan label
    const normalized = [
      ...photos.map((p) => ({ ...p, type: 'photo' })),
      ...singlePhotos.map((p) => ({ ...p, type: 'singlePhoto' })),
      ...strips.map((p) => ({ ...p, type: 'stripPhotoOriginal' })),
    ];

    // Sort by createdAt desc (most recent first)
    normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, photos: normalized });
  } catch (err) {
    console.error('GET /api/sessions/[id]/photos error', err);
    return NextResponse.json({ success: false, error: 'Gagal memuat foto' }, { status: 500 });
  }
}
