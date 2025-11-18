import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil semua sessionId unik dari ketiga tabel
    const [photoSessions, singlePhotoSessions, stripPhotoSessions] = await Promise.all([
      prisma.photo.findMany({
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      prisma.singlePhoto.findMany({
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      prisma.stripPhotoOriginal.findMany({
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
    ]);

    // Gabungkan semua sessionId dan hilangkan duplikat
    const allSessionIds = new Set([
      ...photoSessions.map((p) => p.sessionId),
      ...singlePhotoSessions.map((p) => p.sessionId),
      ...stripPhotoSessions.map((p) => p.sessionId),
    ].filter((sid) => sid && sid.trim() !== ''));

    const uniqueSessionCount = allSessionIds.size;

    return NextResponse.json({
      success: true,
      count: uniqueSessionCount,
    });
  } catch (error) {
    console.error('❌ Error fetching session stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch session statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
