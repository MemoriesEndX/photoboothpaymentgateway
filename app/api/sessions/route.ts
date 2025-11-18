// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil hanya kolom sessionId + createdAt dari tiap tabel
    const [photos, singles, strips] = await Promise.all([
      prisma.photo.findMany({ select: { sessionId: true, createdAt: true } }),
      prisma.singlePhoto.findMany({ select: { sessionId: true, createdAt: true } }),
      prisma.stripPhotoOriginal.findMany({ select: { sessionId: true, createdAt: true } }),
    ]);

    // Gabungkan lalu filter null/empty
    const all = [...photos, ...singles, ...strips].filter(
      (p) => p.sessionId !== null && p.sessionId !== ''
    );

    // Build map unique berdasarkan sessionId; simpan createdAt paling baru supaya bisa di-sort
    const map = new Map<string, { sessionId: string; createdAt: Date }>();

    for (const item of all) {
      const sid = String(item.sessionId);
      const createdAt = new Date(item.createdAt);
      if (!map.has(sid) || createdAt.getTime() > map.get(sid)!.createdAt.getTime()) {
        map.set(sid, { sessionId: sid, createdAt });
      }
    }

    const sessions = Array.from(map.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('GET /api/sessions error', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat sessions' }, { status: 500 });
  }
}
