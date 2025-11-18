/**
 * Single Photo Gallery Page - Raw Single Photos
 * Displays raw single photos for a specific session
 * 
 * Route: /admin/gallery/[sessionId]/single
 */

"use client";

import { use } from "react";
import { useGalleryPhotos } from "@/hooks/use-gallery-photos";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SessionHeader } from "@/components/gallery/SessionHeader";

interface SinglePhotoGalleryPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SinglePhotoGalleryPage({
  params,
}: SinglePhotoGalleryPageProps) {
  // Unwrap params using React.use()
  const { sessionId } = use(params);

  // Fetch photos using reusable hook
  const { photos, loading, error } = useGalleryPhotos({
    type: "single",
    sessionId,
    autoFetch: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionHeader
        sessionId={sessionId}
        title="Single Photos"
        description="View all raw single photos captured in this session"
      />

      <GalleryGrid
        photos={photos}
        loading={loading}
        error={error}
        emptyMessage="No single photos found for this session"
        loadingMessage="Loading single photos..."
        columns={{
          default: 2,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6,
        }}
      />
    </div>
  );
}

