import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    // ✅ Mapping sesuai model Prisma (huruf besar!)
    const modelMap = {
      photo: prisma.Photo,
      singlePhoto: prisma.SinglePhoto,
      stripPhotoOriginal: prisma.StripPhotoOriginal,
    } as const;

    // Pastikan type valid
    const model = modelMap[type as keyof typeof modelMap];
    if (!model) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }

    // 🧹 Hapus dari database
    const deleted = await model.delete({
      where: { id: Number(id) }, // karena id di schema bertipe Int
    });

    console.log(`✅ Deleted ${type} with ID ${id}`);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
