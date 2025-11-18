import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; //sesuaikan lokasi prisma client
import { startOfDay, endOfDay } from "date-fns";

function groupByDate(data: any[]) {
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
        select: { id: true, createdAt: true, category: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.singlePhoto.findMany({
        select: { id: true, createdAt: true, category: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.stripPhotoOriginal.findMany({
        select: { id: true, createdAt: true, category: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      photo: {
        total: photo.length,
        byDate: groupByDate(photo),
        byCategory: groupByCategory(photo),
      },
      singlePhoto: {
        total: singlePhoto.length,
        byDate: groupByDate(singlePhoto),
        byCategory: groupByCategory(singlePhoto),
      },
      stripPhotoOriginal: {
        total: stripPhotoOriginal.length,
        byDate: groupByDate(stripPhotoOriginal),
        byCategory: groupByCategory(stripPhotoOriginal),
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

function groupByCategory(data: any[]) {
  const map: Record<string, number> = {};

  data.forEach((item) => {
    const cat = item.category || "Unknown";
    map[cat] = (map[cat] || 0) + 1;
  });

  return Object.entries(map).map(([category, count]) => ({
    category,
    count,
  }));
}
