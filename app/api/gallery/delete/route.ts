import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    // mapping nama type ke model prisma
    const modelMap = {
      photo: prisma.Photo,
      singlePhoto: prisma.SinglePhoto,
      stripPhotoOriginal: prisma.StripPhotoOriginal,
    } as const;

    const model = modelMap[type as keyof typeof modelMap];

    if (!model) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await model.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
