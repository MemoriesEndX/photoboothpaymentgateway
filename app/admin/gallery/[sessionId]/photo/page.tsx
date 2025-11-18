/**
 * Photo Gallery Page - Final Processed Photos
 * Displays final processed photos for a specific session
 * 
 * Route: /admin/gallery/[sessionId]/photo
 */

"use client";

import { use } from "react";
import { useGalleryPhotos } from "@/hooks/use-gallery-photos";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SessionHeader } from "@/components/gallery/SessionHeader";

interface PhotoGalleryPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function PhotoGalleryPage({ params }: PhotoGalleryPageProps) {
  // Unwrap params using React.use()
  const { sessionId } = use(params);

  // Fetch photos using reusable hook
  const { photos, loading, error } = useGalleryPhotos({
    type: "photo",
    sessionId,
    autoFetch: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionHeader
        sessionId={sessionId}
        title="Final Processed Photos"
        description="View all final processed photos for this session"
      />

      <GalleryGrid
        photos={photos}
        loading={loading}
        error={error}
        emptyMessage="No final processed photos found for this session"
        loadingMessage="Loading final photos..."
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

