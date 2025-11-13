import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const photo = await prisma.photo.findFirst({
    where: { sessionId, queueNumber: 1 },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(photo || {});
}
