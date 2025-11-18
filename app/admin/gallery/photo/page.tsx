/**
 * Photo Gallery Page - Final Processed Photos
 * Displays all final processed photos from the Photo table
 * 
 * Route: /admin/gallery/photo
 */

"use client";

import { useState, useEffect } from "react";
import { useGalleryPhotos } from "@/hooks/use-gallery-photos";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { ImageIcon, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function PhotoGalleryPage() {
  // Fetch all photos from Photo table (no session filter)
  const { photos, loading, error, refetch } = useGalleryPhotos({
    type: "photo",
    autoFetch: true,
  });

  const [localPhotos, setLocalPhotos] = useState(photos);

  // Update local photos when fetched photos change
  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const handlePhotoDelete = (photoId: string) => {
    setLocalPhotos((prev) => prev.filter((p) => p.id.toString() !== photoId));
  };

  const handleDeleteAll = async () => {
    if (localPhotos.length === 0) {
      toast({ title: 'ℹ️ Tidak ada foto', description: 'Tidak ada foto untuk dihapus.' });
      return;
    }

    if (!confirm(`Yakin hapus SEMUA foto (${localPhotos.length})? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    try {
      for (const photo of localPhotos) {
        await fetch('/api/gallery/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: photo.id, type: 'photo' }),
        });
      }

      setLocalPhotos([]);
      toast({ title: '🗑️ Semua Dihapus', description: `${localPhotos.length} foto telah dihapus.` });
      refetch();
    } catch {
      toast({ title: '❌ Gagal', description: 'Gagal menghapus semua foto.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GalleryHeader
        title="Final Processed Photos"
        description="Browse all final processed photos from completed photo booth sessions. These are the finalized images ready for delivery."
        icon={<ImageIcon className="h-6 w-6" />}
        photoCount={!loading && !error ? localPhotos.length : undefined}
      />

      <div className="px-6 pt-4 flex justify-end gap-3">
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteAll}
          disabled={localPhotos.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus Semua ({localPhotos.length})
        </Button>
      </div>

      <GalleryGrid
        photos={localPhotos}
        loading={loading}
        error={error}
        emptyMessage="No final processed photos found. Photos will appear here after processing."
        loadingMessage="Loading final photos..."
        columns={{
          default: 2,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6,
        }}
        photoType="photo"
        onPhotoDelete={handlePhotoDelete}
      />
    </div>
  );
}
