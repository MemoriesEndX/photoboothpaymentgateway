import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type DateItem = { createdAt: Date };

function groupByDate(data: DateItem[]) {
  const result: Record<string, number> = {};

  data.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0];
    result[date] = (result[date] || 0) + 1;
  });

  return Object.entries(result).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function GET() {
  try {
    const [photo, single, strip] = await Promise.all([
      prisma.photo.findMany({ select: { createdAt: true } }),
      prisma.singlePhoto.findMany({ select: { createdAt: true } }),
      prisma.stripPhotoOriginal.findMany({ select: { createdAt: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        photo: groupByDate(photo),
        singlePhoto: groupByDate(single),
        stripPhotoOriginal: groupByDate(strip),
      },
    });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
