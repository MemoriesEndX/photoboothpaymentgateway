import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type DateItem = {
  id: number;
  createdAt: Date;
};

function groupByDate(data: DateItem[]) {
  const result: Record<string, number> = {};

  data.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    result[date] = (result[date] || 0) + 1;
  });

  return Object.entries(result).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function GET() {
  try {
    const [photo, singlePhoto, stripPhotoOriginal] = await Promise.all([
      prisma.photo.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.singlePhoto.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.stripPhotoOriginal.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      photo: {
        total: photo.length,
        byDate: groupByDate(photo),
      },
      singlePhoto: {
        total: singlePhoto.length,
        byDate: groupByDate(singlePhoto),
      },
      stripPhotoOriginal: {
        total: stripPhotoOriginal.length,
        byDate: groupByDate(stripPhotoOriginal),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
