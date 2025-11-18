/**
 * Reusable Gallery Grid Component
 * Displays photos in a responsive grid with loading and empty states
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ImageOff, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { AnyPhoto } from "@/types/photos";

interface GalleryGridProps {
  photos: AnyPhoto[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingMessage?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onPhotoClick?: (photo: AnyPhoto) => void;
  photoType?: 'photo' | 'singlePhoto' | 'stripPhotoOriginal';
  onPhotoDelete?: (photoId: string) => void;
}

/**
 * Loading State Component
 */
function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <ImageOff className="h-16 w-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <ImageOff className="h-12 w-12" />
      </div>
      <p className="text-lg font-semibold mb-2">Failed to Load Photos</p>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Photo Card Component
 */
function PhotoCard({
  photo,
  photoType,
  onDelete,
}: {
  photo: AnyPhoto;
  photoType?: string;
  onDelete?: (photoId: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const r = await fetch(photo.url);
      if (!r.ok) throw new Error('Gagal mengunduh');
      const blob = await r.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(u);
      toast({ title: '✅ Berhasil', description: 'Foto berhasil diunduh.' });
    } catch {
      toast({ title: '❌ Gagal', description: 'Download gagal.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus foto ini?`)) return;
    try {
      setDeleting(true);
      const res = await fetch('/api/gallery/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, type: photoType || 'photo' }),
      });
      if (!res.ok) throw new Error('Gagal hapus');
      
      if (onDelete) {
        onDelete(photo.id.toString());
      }
      
      toast({ title: '🗑️ Dihapus', description: 'Foto telah dihapus.' });
    } catch {
      toast({ title: '❌ Gagal', description: 'Gagal menghapus foto.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-md transition-all hover:shadow-xl cursor-pointer"
        >
          <Image
            src={photo.url}
            alt={`Photo ${photo.id}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />

          {/* Photo info badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
            <span className="bg-black/70 text-white px-2 py-1 rounded">
              #{photo.id}
            </span>
            {photo.paid && (
              <span className="bg-green-500 text-white px-2 py-1 rounded">
                Paid
              </span>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Photo #{photo.id}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          <img
            src={photo.url}
            alt={`Photo ${photo.id}`}
            className="max-h-[70vh] w-full object-contain rounded-lg border border-gray-200"
          />
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Mengunduh...' : 'Download'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Main Gallery Grid Component
 */
export function GalleryGrid({
  photos,
  loading = false,
  error = null,
  emptyMessage = "No photos found",
  loadingMessage = "Loading photos...",
  columns = {
    default: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
  photoType,
  onPhotoDelete,
}: GalleryGridProps) {
  // Show loading state
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Show empty state
  if (photos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // Build grid classes based on columns config
  const gridClasses = [
    `grid-cols-${columns.default || 2}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      <div className={`grid ${gridClasses} gap-4`}>
        {photos.map((photo) => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            photoType={photoType}
            onDelete={onPhotoDelete}
          />
        ))}
      </div>
    </div>
  );
}
