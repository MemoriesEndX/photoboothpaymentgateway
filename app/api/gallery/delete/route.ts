import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    // Delete based on type
    const photoId = Number(id);

    switch (type) {
      case 'photo':
        await prisma.photo.delete({ where: { id: photoId } });
        break;
      case 'singlePhoto':
        await prisma.singlePhoto.delete({ where: { id: photoId } });
        break;
      case 'stripPhotoOriginal':
        await prisma.stripPhotoOriginal.delete({ where: { id: photoId } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
