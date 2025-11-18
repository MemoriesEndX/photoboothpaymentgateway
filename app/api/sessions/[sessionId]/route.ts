import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PhotoWithType } from '@/types/photo';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId || sessionId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('📸 Fetching photos for session:', sessionId);

    // Fetch photos from Photo table
    const photos = await prisma.photo.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        storagePath: true,
        sessionId: true,
        createdAt: true,
        filename: true,
        thumbnailPath: true,
        packageId: true,
        paid: true,
        amountPaid: true,
        metadata: true,
        queueNumber: true,
      },
    });

    // Fetch photos from SinglePhoto table
    const singlePhotos = await prisma.singlePhoto.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        storagePath: true,
        sessionId: true,
        createdAt: true,
        filename: true,
        thumbnailPath: true,
        packageId: true,
        paid: true,
        amountPaid: true,
        metadata: true,
        queueNumber: true,
      },
    });

    // Fetch photos from StripPhotoOriginal table
    const stripPhotoOriginals = await prisma.stripPhotoOriginal.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        storagePath: true,
        sessionId: true,
        createdAt: true,
        filename: true,
        thumbnailPath: true,
        packageId: true,
        paid: true,
        amountPaid: true,
        metadata: true,
        queueNumber: true,
      },
    });

    // Combine all 3 tables into one array with type tags
    const allPhotos: PhotoWithType[] = [
      ...photos.map((p) => ({
        ...p,
        type: 'photo' as const,
        timestamp: p.createdAt,
        amountPaid: p.amountPaid ? Number(p.amountPaid) : null,
      })),
      ...singlePhotos.map((p) => ({
        ...p,
        type: 'singlePhoto' as const,
        timestamp: p.createdAt,
        amountPaid: p.amountPaid ? Number(p.amountPaid) : null,
      })),
      ...stripPhotoOriginals.map((p) => ({
        ...p,
        type: 'stripPhotoOriginal' as const,
        timestamp: p.createdAt,
        amountPaid: p.amountPaid ? Number(p.amountPaid) : null,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log(
      `✅ Found ${allPhotos.length} photos (${photos.length} processed, ${singlePhotos.length} single, ${stripPhotoOriginals.length} strip originals)`
    );

    return NextResponse.json({
      success: true,
      count: allPhotos.length,
      photos: allPhotos,
    });
  } catch (error) {
    console.error('❌ Error fetching photos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
