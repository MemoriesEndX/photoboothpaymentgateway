import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(photos);
}
