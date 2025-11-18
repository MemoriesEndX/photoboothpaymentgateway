'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import type { PhotoWithType, PhotosResponse } from '@/types/photo';

export default function AdminGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string | undefined;

  const [photos, setPhotos] = useState<PhotoWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch photos for this session
  useEffect(() => {
    if (!sessionId) {
      setError('Session ID tidak ditemukan');
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch photos');
        }

        const data: PhotosResponse = await res.json();

        if (!mounted) return;

        if (data.success) {
          setPhotos(data.photos || []);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('❌ Error loading photos:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Gagal memuat foto');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPhotos();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // Download photo
  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.info('Mengunduh foto...');
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Foto berhasil diunduh 📸');
    } catch {
      toast.error('Gagal mengunduh foto ❌');
    }
  };

  // Delete photo
  const handleDelete = async () => {
    if (!selectedPhoto) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPhoto.id,
          type: selectedPhoto.type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menghapus foto');
      }

      setPhotos((prev) => prev.filter((p) => p.id !== selectedPhoto.id || p.type !== selectedPhoto.type));
      toast.success('Foto berhasil dihapus 🗑️');
      setSelectedPhoto(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus foto ❌');
    } finally {
      setDeleting(false);
    }
  };

  // Get photo type badge
  const getTypeBadge = (type: string) => {
    const badges = {
      photo: { label: 'Processed', color: 'bg-green-500' },
      singlePhoto: { label: 'Single', color: 'bg-blue-500' },
      stripPhotoOriginal: { label: 'Strip Original', color: 'bg-purple-500' },
    };
    const badge = badges[type as keyof typeof badges] || { label: type, color: 'bg-gray-500' };
    return (
      <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-500">Memuat foto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-red-600 font-semibold">❌ Error</p>
              <p className="text-red-800">{error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="text-6xl">📭</div>
              <p className="text-xl font-semibold text-gray-700">Tidak ada foto</p>
              <p className="text-gray-500">
                Belum ada foto yang tersimpan untuk session ini.
              </p>
              <Link href="/admin/sessions">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Daftar Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/sessions">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">📷 Gallery Session</h1>
          <p className="text-gray-500 mt-1">
            Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Foto</p>
          <p className="text-3xl font-bold text-primary">{photos.length}</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card
            key={`${photo.type}-${photo.id}`}
            onClick={() => setSelectedPhoto(photo)}
            className="relative cursor-pointer overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs font-medium truncate">{photo.filename}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  {getTypeBadge(photo.type)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-4">
                <span className="truncate">{selectedPhoto.filename}</span>
                {getTypeBadge(selectedPhoto.type)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image */}
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.filename}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Session ID</p>
                  <p className="font-medium">{selectedPhoto.sessionId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipe</p>
                  <p className="font-medium capitalize">{selectedPhoto.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dibuat</p>
                  <p className="font-medium">
                    {new Date(selectedPhoto.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Queue Number</p>
                  <p className="font-medium">{selectedPhoto.queueNumber}</p>
                </div>
                {selectedPhoto.packageId && (
                  <div>
                    <p className="text-gray-500">Package ID</p>
                    <p className="font-medium">{selectedPhoto.packageId}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Status Pembayaran</p>
                  <p className={`font-medium ${selectedPhoto.paid ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedPhoto.paid ? '✓ Sudah Dibayar' : '○ Belum Dibayar'}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2">
              <Button
                onClick={() => handleDownload(selectedPhoto.url, selectedPhoto.filename)}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="destructive"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
