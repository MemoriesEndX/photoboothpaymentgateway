/**
 * Photos Admin API Route
 * Handles fetching photos by type with optional session filtering
 * 
 * Endpoint: GET /api/photos-admin
 * Query Params:
 *   - type: 'photo' | 'single' | 'strip' (required)
 *   - sessionId: string (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { PhotoType } from "@/types/photos";

// Valid photo types
const VALID_PHOTO_TYPES: PhotoType[] = ["photo", "single", "strip"];

/**
 * Validation Error Response
 */
function validationError(message: string, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: code || "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}

/**
 * Server Error Response
 */
function serverError(message: string = "Internal server error") {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "SERVER_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Success Response
 */
function successResponse<T>(data: T[], count: number) {
  return NextResponse.json(
    {
      success: true,
      count,
      data,
    },
    { status: 200 }
  );
}

/**
 * Validate photo type parameter
 */
function validatePhotoType(type: string | null): PhotoType | null {
  if (!type) {
    return null;
  }

  if (!VALID_PHOTO_TYPES.includes(type as PhotoType)) {
    return null;
  }

  return type as PhotoType;
}

/**
 * Validate session ID parameter
 */
function validateSessionId(sessionId: string | null): string | null {
  if (!sessionId) {
    return null;
  }

  const trimmed = sessionId.trim();
  
  if (trimmed.length === 0) {
    return null;
  }

  // Session ID should be alphanumeric with hyphens/underscores
  const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!sessionIdRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Fetch photos from database based on type
 */
async function fetchPhotosByType(
  type: PhotoType,
  sessionId?: string | null
) {
  const whereClause = sessionId ? { sessionId } : {};

  switch (type) {
    case "photo":
      return await prisma.photo.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          userId: true,
          sessionId: true,
          storagePath: true,
          filename: true,
          thumbnailPath: true,
          packageId: true,
          paid: true,
          amountPaid: true,
          metadata: true,
          queueNumber: true,
          createdAt: true,
        },
      });

    case "single":
      return await prisma.singlePhoto.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          userId: true,
          sessionId: true,
          storagePath: true,
          filename: true,
          thumbnailPath: true,
          packageId: true,
          paid: true,
          amountPaid: true,
          metadata: true,
          queueNumber: true,
          createdAt: true,
        },
      });

    case "strip":
      return await prisma.stripPhotoOriginal.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          userId: true,
          sessionId: true,
          storagePath: true,
          filename: true,
          thumbnailPath: true,
          packageId: true,
          paid: true,
          amountPaid: true,
          metadata: true,
          queueNumber: true,
          createdAt: true,
        },
      });

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = type;
      throw new Error(`Unhandled photo type: ${_exhaustive}`);
  }
}

/**
 * GET Handler
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const sessionIdParam = searchParams.get("sessionId");

    // Validate type parameter (required)
    const type = validatePhotoType(typeParam);
    if (!type) {
      return validationError(
        typeParam
          ? `Invalid type. Must be one of: ${VALID_PHOTO_TYPES.join(", ")}`
          : "Missing required parameter: type",
        "INVALID_TYPE"
      );
    }

    // Validate session ID parameter (optional - can be null for all photos)
    let sessionId: string | null = null;
    if (sessionIdParam) {
      sessionId = validateSessionId(sessionIdParam);
      if (!sessionId) {
        return validationError(
          "Invalid sessionId format. Must be alphanumeric with hyphens/underscores",
          "INVALID_SESSION_ID"
        );
      }
    }

    // Fetch photos from database (with or without sessionId filter)
    const photos = await fetchPhotosByType(type, sessionId);

    // Return success response
    return successResponse(photos, photos.length);
  } catch (error) {
    // Log error for debugging
    console.error("[photos-admin API] Error:", error);

    // Return generic error to client
    return serverError();
  }
}
