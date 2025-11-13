'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function GalleryPage() {
  const { sessionId } = useParams();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 🧠 Fetch photos
  useEffect(() => {
    if (!sessionId) return;

    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/photos?sessionId=${sessionId}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }

        const data = await res.json();
        setPhotos(data.photos || []);
      } catch (err: any) {
        console.error('❌ Error loading photos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [sessionId]);

  // 💾 Download photo
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Foto berhasil diunduh 📸');
    } catch {
      toast.error('Gagal mengunduh foto ❌');
    }
  };

  // 🗑️ Delete photo
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
      if (!res.ok) throw new Error('Gagal menghapus foto');
      setPhotos((prev) => prev.filter((p) => p.id !== selectedPhoto.id));
      toast.success('Foto berhasil dihapus 🗑️');
      setSelectedPhoto(null);
    } catch (err) {
      toast.error('Gagal menghapus foto ❌');
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Memuat foto...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!photos.length)
    return (
      <p className="text-center text-gray-400 mt-10">
        Tidak ada foto pada sesi ini.
      </p>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        📷 Gallery Session {sessionId}
      </h1>

      {/* 📸 Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative cursor-pointer overflow-hidden group shadow-md hover:shadow-lg transition-all"
          >
            <CardContent className="p-2">
              <Image
                src={photo.url}
                alt={photo.filename}
                width={400}
                height={400}
                className="rounded-lg object-cover w-full h-48"
              />
              <p className="text-xs text-gray-500 mt-1 truncate text-center">
                {photo.filename}
              </p>
            </CardContent>
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-all">
              Klik untuk lihat detail
            </div>
          </Card>
        ))}
      </div>

      {/* 🧩 Popup detail photo */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">
                {selectedPhoto.filename}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                {new Date(selectedPhoto.createdAt).toLocaleString('id-ID')}
              </p>
            </DialogHeader>

            <div className="mt-2 flex justify-center">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                width={800}
                height={800}
                className="rounded-lg object-contain max-h-[70vh]"
              />
            </div>

            {/* Metadata Section */}
            <div className="mt-4 border rounded-md bg-gray-50 p-3 text-sm space-y-1">
              <p>
                <span className="font-medium text-gray-800">Tipe:</span>{' '}
                {selectedPhoto.type}
              </p>
              <p>
                <span className="font-medium text-gray-800">Session:</span>{' '}
                {selectedPhoto.sessionId}
              </p>
              <p>
                <span className="font-medium text-gray-800">Waktu:</span>{' '}
                {new Date(selectedPhoto.createdAt).toLocaleString('id-ID')}
              </p>
              <p className="break-words">
                <span className="font-medium text-gray-800">Metadata:</span>{' '}
                {JSON.stringify(selectedPhoto.metadata)}
              </p>
            </div>

            <DialogFooter className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  handleDownload(selectedPhoto.url, selectedPhoto.filename)
                }
              >
                <Download className="mr-2 w-4 h-4" /> Download
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 w-4 h-4" />
                {deleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
