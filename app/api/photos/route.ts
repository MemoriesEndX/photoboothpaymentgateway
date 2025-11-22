import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
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
        metadata: true,
        queueNumber: true,
      },
    });

    // ✅ Combine all 3 tables into one array and tag each type
    // Normalize URLs to ensure they're accessible
    const normalizeUrl = (photo: { url?: string | null; storagePath?: string | null; filename?: string | null }) => {
      // Prefer url field
      if (photo.url) return photo.url;
      // Fallback to storagePath
      if (photo.storagePath) return photo.storagePath;
      // Build from filename as last resort
      if (photo.filename) {
        // Check if filename already has path
        if (photo.filename.startsWith('/')) return photo.filename;
        return `/uploads/${photo.filename}`;
      }
      return null;
    };

    const allPhotos = [
      ...photos.map((p) => ({ 
        ...p, 
        type: 'photo' as const, 
        timestamp: p.createdAt,
        url: normalizeUrl(p) || p.url,
      })),
      ...singlePhotos.map((p) => ({ 
        ...p, 
        type: 'singlePhoto' as const, 
        timestamp: p.createdAt,
        url: normalizeUrl(p) || p.url,
      })),
      ...stripPhotoOriginals.map((p) => ({ 
        ...p, 
        type: 'stripPhotoOriginal' as const, 
        timestamp: p.createdAt,
        url: normalizeUrl(p) || p.url,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log(
      `✅ Found ${allPhotos.length} photos (${photos.length} from Photo, ${singlePhotos.length} from SinglePhoto, ${stripPhotoOriginals.length} from StripPhotoOriginal)`
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
        error: 'Failed to fetch photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
