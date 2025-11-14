// /api/photos/all/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch data dari setiap tabel
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, filename: true, createdAt: true },
    })

    const singlePhotos = await prisma.singlePhoto.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, filename: true, createdAt: true },
    })

    const stripPhotoOriginals = await prisma.stripPhotoOriginal.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, filename: true, createdAt: true },
    })

    return NextResponse.json({
      photos,
      singlePhotos,
      stripPhotoOriginals,
    })
  } catch (error) {
    console.error('❌ Error fetching photos:', error)
    return NextResponse.json({ error: 'Gagal mengambil data foto' }, { status: 500 })
  }
}
