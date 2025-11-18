/**
 * Photo Gallery API Client
 * Type-safe fetchers for photo-related API endpoints
 */

import { apiFetch, buildUrl } from "@/lib/api-client";
import type {
  PhotoType,
  AnyPhoto,
} from "@/types/photos";

/**
 * Fetch all photos by type (without session filter)
 */
export async function fetchPhotosByType(type: PhotoType): Promise<AnyPhoto[]> {
  const url = buildUrl("/api/photos-admin", { type });
  return apiFetch<AnyPhoto[]>(url);
}

/**
 * Fetch photos for a specific session
 */
export async function fetchPhotosBySession(
  type: PhotoType,
  sessionId: string
): Promise<AnyPhoto[]> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new Error("Session ID is required");
  }

  const url = buildUrl("/api/photos-admin", { type, sessionId });
  return apiFetch<AnyPhoto[]>(url);
}
