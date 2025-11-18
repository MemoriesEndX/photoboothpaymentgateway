/**
 * Admin Statistics API
 * Provides comprehensive statistics for the admin dashboard
 * 
 * Endpoint: GET /api/admin/stats
 * Returns:
 *   - totalSessions: Unique session count across all photo tables
 *   - photoFinal: Count of final processed photos
 *   - singlePhoto: Count of raw single photos
 *   - stripPhoto: Count of strip photo originals
 *   - totalPhotos: Sum of all photo counts
 *   - totalUsers: Total user count
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Calculate total unique sessions across all photo tables
 */
async function calculateTotalSessions(): Promise<number> {
  try {
    // Get unique sessionIds from each table
    const [photoSessions, singleSessions, stripSessions] = await Promise.all([
      prisma.photo.findMany({
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      prisma.singlePhoto.findMany({
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      prisma.stripPhotoOriginal.findMany({
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
    ]);

    // Combine and deduplicate session IDs
    const allSessionIds = new Set<string>([
      ...photoSessions.map((p) => p.sessionId),
      ...singleSessions.map((s) => s.sessionId),
      ...stripSessions.map((s) => s.sessionId),
    ]);

    return allSessionIds.size;
  } catch (error) {
    console.error("Error calculating total sessions:", error);
    return 0;
  }
}

/**
 * GET Handler - Fetch comprehensive admin statistics
 */
export async function GET() {
  try {
    // Parallel fetch for optimal performance
    const [photoCount, singleCount, stripCount, userCount, totalSessions] =
      await Promise.all([
        prisma.photo.count(),
        prisma.singlePhoto.count(),
        prisma.stripPhotoOriginal.count(),
        prisma.user.count(),
        calculateTotalSessions(),
      ]);

    const totalPhotos = photoCount + singleCount + stripCount;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalSessions,
          photoFinal: photoCount,
          singlePhoto: singleCount,
          stripPhoto: stripCount,
          totalPhotos,
          totalUsers: userCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[admin/stats API] Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
        code: "STATS_ERROR",
      },
      { status: 500 }
    );
  }
}
