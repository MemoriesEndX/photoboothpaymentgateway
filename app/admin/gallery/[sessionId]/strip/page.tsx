/**
 * Strip Photo Gallery Page - Strip Photo Originals
 * Displays strip photo originals for a specific session
 * 
 * Route: /admin/gallery/[sessionId]/strip
 */

"use client";

import { use } from "react";
import { useGalleryPhotos } from "@/hooks/use-gallery-photos";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SessionHeader } from "@/components/gallery/SessionHeader";

interface StripGalleryPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function StripGalleryPage({ params }: StripGalleryPageProps) {
  // Unwrap params using React.use()
  const { sessionId } = use(params);

  // Fetch photos using reusable hook
  const { photos, loading, error } = useGalleryPhotos({
    type: "strip",
    sessionId,
    autoFetch: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionHeader
        sessionId={sessionId}
        title="Strip Photo Originals"
        description="View all original strip photos captured in this session"
      />

      <GalleryGrid
        photos={photos}
        loading={loading}
        error={error}
        emptyMessage="No strip photos found for this session"
        loadingMessage="Loading strip photos..."
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

