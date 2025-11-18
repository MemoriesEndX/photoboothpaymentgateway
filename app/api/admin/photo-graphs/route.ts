import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function groupByDate(data: any[]) {
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
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
