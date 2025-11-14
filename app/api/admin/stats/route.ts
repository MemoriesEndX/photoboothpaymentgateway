// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Hitung tiap tabel (fast)
    const [photoCount, singleCount, stripCount] = await Promise.all([
      prisma.photo.count(),
      prisma.singlePhoto.count(),
      prisma.stripPhotoOriginal.count(),
    ])

    const totalPhotos = photoCount + singleCount + stripCount

    return NextResponse.json({
      success: true,
      counts: {
        photos: photoCount,
        singlePhotos: singleCount,
        stripPhotoOriginals: stripCount,
        total: totalPhotos,
      },
    })
  } catch (err) {
    console.error('Error fetching stats:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
