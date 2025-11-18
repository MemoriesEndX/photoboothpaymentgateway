/**
 * Custom Hook: useGalleryPhotos
 * Reusable hook for loading gallery photos with proper state management
 * Supports both full gallery (all photos) and filtered by session
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchPhotosByType, fetchPhotosBySession } from "@/lib/api/photos";
import type { PhotoType, AnyPhoto } from "@/types/photos";
import { ApiError } from "@/lib/api-client";

interface UseGalleryPhotosOptions {
  type: PhotoType;
  sessionId?: string; // Optional - if not provided, fetches all photos
  autoFetch?: boolean;
}

interface UseGalleryPhotosReturn {
  photos: AnyPhoto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage gallery photos
 * Can fetch all photos by type OR filter by session
 */
export function useGalleryPhotos({
  type,
  sessionId,
  autoFetch = true,
}: UseGalleryPhotosOptions): UseGalleryPhotosReturn {
  const [photos, setPhotos] = useState<AnyPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: AnyPhoto[];

      // If sessionId provided, fetch filtered photos
      if (sessionId) {
        // Validate sessionId
        if (sessionId.trim().length === 0) {
          setError("Invalid session ID");
          setLoading(false);
          return;
        }
        data = await fetchPhotosBySession(type, sessionId);
      } else {
        // Fetch all photos by type
        data = await fetchPhotosByType(type);
      }

      setPhotos(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to load photos";

      setError(errorMessage);
      console.error(`Failed to fetch ${type} photos:`, err);
    } finally {
      setLoading(false);
    }
  }, [type, sessionId]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    photos,
    loading,
    error,
    refetch: fetchData,
  };
}
