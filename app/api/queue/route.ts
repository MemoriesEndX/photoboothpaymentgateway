import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Ambil queue terakhir di database
  const lastPhoto = await prisma.photo.findFirst({
    orderBy: { queueNumber: 'desc' },
  });
  const nextQueue = (lastPhoto?.queueNumber || 0) + 1;
  return NextResponse.json({ nextQueue });
}
