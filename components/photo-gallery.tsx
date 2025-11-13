'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface GalleryPhoto {
  id: number;
  url: string;
  storagePath: string;
  sessionId: string;
  timestamp: Date;
  filename: string;
  metadata?: Record<string, unknown>;
  type: 'photo' | 'singlePhoto';
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get sessionId from localStorage (bukan sessionStorage lagi)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentSession = localStorage.getItem('sessionId');

      if (!currentSession) {
        toast({
          title: '⚠️ Belum ada sesi aktif',
          description: 'Silakan mulai sesi photobooth terlebih dahulu.',
          variant: 'destructive',
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      setSessionId(currentSession);
      console.log('📸 Session ID from localStorage:', currentSession);
    }
  }, []);

  // Fetch photos based on sessionId
  const fetchPhotos = useCallback(async (sid: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching photos for session:', sid);

      const response = await fetch(`/api/photos?sessionId=${encodeURIComponent(sid)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load photos');
      }

      const data = await response.json();
      
      if (data.success) {
        setPhotos(data.photos || []);
        console.log(`✅ Loaded ${data.count} photos from gallery`);
        
        if (data.count > 0) {
          toast({
            title: '✅ Galeri Dimuat',
            description: `${data.count} foto ditemukan untuk sesi ini.`,
            duration: 2000,
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error fetching photos:', error);
      toast({
        title: '❌ Gagal Memuat Galeri',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
      setPhotos([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Trigger fetch when sessionId changes (reset gallery first)
  useEffect(() => {
    if (!sessionId) return;

    // Hapus foto lama saat sesi berubah
    setPhotos([]);
    setIsLoading(true);

    toast({
      title: '🔄 Sesi Diperbarui',
      description: 'Menampilkan galeri untuk sesi baru...',
      duration: 2000,
    });

    // Ambil foto dari sesi baru
    fetchPhotos(sessionId);
  }, [sessionId, fetchPhotos]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (!sessionId) {
      toast({
        title: '⚠️ Tidak Ada Sesi',
        description: 'Silakan mulai sesi terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefreshing(true);
    toast({
      title: '🔄 Memperbarui...',
      description: 'Mengambil data terbaru dari server.',
      duration: 1500,
    });
    fetchPhotos(sessionId);
  }, [sessionId, fetchPhotos]);


  // Download handler
  const handleDownload = useCallback(async (photo: GalleryPhoto) => {
    setIsDownloading(photo.id);
    
    try {
      // If it's a base64 URL, download directly
      if (photo.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.download = photo.filename || `photo-${photo.id}.jpg`;
        link.href = photo.url;
        link.click();
      } else {
        // If it's a regular URL, fetch and download
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = photo.filename || `photo-${photo.id}.jpg`;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: '✅ Download Berhasil',
        description: `${photo.filename} telah diunduh.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: '❌ Download Gagal',
        description: 'Terjadi kesalahan saat mengunduh foto.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  }, []);

const handleDeletePhoto = useCallback(async (photo: GalleryPhoto) => {
  if (!confirm(`Yakin ingin menghapus foto "${photo.filename}"?`)) return;

  try {
    const response = await fetch('/api/gallery/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id, type: photo.type }),
    });

    if (!response.ok) throw new Error('Failed to delete photo');

    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));

    toast({
      title: '✅ Foto Dihapus',
      description: 'Foto berhasil dihapus dari galeri.',
      duration: 2000,
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    toast({
      title: '❌ Hapus Gagal',
      description: 'Terjadi kesalahan saat menghapus foto.',
      variant: 'destructive',
    });
  }
}, []);


  if (isLoading && !isRefreshing) {
    return (
      <div className='text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4'></div>
        <p className='text-gray-600 font-medium'>Memuat galeri foto...</p>
      </div>
    );
  }

  // Filter photos by current sessionId
  const filteredPhotos = photos.filter((p) => p.sessionId === sessionId);

  return (
    <div className='space-y-4 relative'>
      {/* Session Indicator - Fixed bottom right */}
      {sessionId && (
        <div className='fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50 flex items-center gap-2'>
          <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
          <div>
            <p className='text-xs opacity-90'>Sesi Aktif:</p>
            <p className='font-semibold'>{sessionId.slice(0, 8)}...</p>
          </div>
        </div>
      )}

      {/* Header with Refresh Button */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-gray-800'>
          📸 Galeri Foto
          {filteredPhotos.length > 0 && (
            <span className='ml-2 text-sm text-gray-500 font-normal'>
              ({filteredPhotos.length} foto)
            </span>
          )}
        </h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || !sessionId}
          variant='outline'
          size='sm'
          className='flex items-center gap-2'>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Memperbarui...' : 'Refresh'}
        </Button>
      </div>

      {/* Gallery Grid */}
      {!sessionId ? (
        <div className='text-center p-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-dashed border-orange-300'>
          <p className='text-orange-600 font-medium text-lg mb-2'>⚠️ Belum Ada Sesi Aktif</p>
          <p className='text-gray-600'>
            Silakan mulai sesi photobooth terlebih dahulu untuk melihat galeri.
          </p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className='text-center p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300'>
          <p className='text-blue-600 font-medium text-lg mb-2'>📷 Galeri Kosong</p>
          <p className='text-gray-600'>Belum ada foto untuk sesi ini. Mulai ambil foto!</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {filteredPhotos.map((photo) => (
            <Dialog key={`${photo.type}-${photo.id}`}>
              <DialogTrigger asChild>
                <div className='relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 aspect-square bg-gray-100'>
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center'>
                    <span className='text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium'>
                      Lihat Detail
                    </span>
                  </div>
                  {/* Photo Type Badge */}
                  <div className='absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
                    {photo.type === 'singlePhoto' ? '📸 Single' : '🎞️ Strip'}
                  </div>
                  {/* Session ID Badge */}
                  <div className='absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                    {photo.sessionId.slice(0, 6)}
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className='sm:max-w-2xl'>
                <DialogHeader>
                  <DialogTitle className='flex items-center justify-between'>
                    <span>{photo.filename}</span>
                    <span className='text-sm text-gray-500 font-normal'>
                      {new Date(photo.timestamp).toLocaleString('id-ID')}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className='flex flex-col items-center gap-4'>
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className='max-h-[70vh] w-full object-contain rounded-lg border border-gray-200'
                  />
                  
                  {/* Photo Info */}
                  <div className='w-full bg-gray-50 p-3 rounded-lg text-sm'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <span className='text-gray-600'>Tipe:</span>{' '}
                        <span className='font-medium'>
                          {photo.type === 'singlePhoto' ? 'Single Photo' : 'Photo Strip'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Session:</span>{' '}
                        <span className='font-medium text-xs'>{photo.sessionId.slice(0, 8)}...</span>
                      </div>
                      <div className='col-span-2'>
                        <span className='text-gray-600'>Waktu:</span>{' '}
                        <span className='font-medium'>
                          {new Date(photo.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {photo.metadata && (
                        <div className='col-span-2'>
                          <span className='text-gray-600'>Metadata:</span>{' '}
                          <span className='font-medium text-xs'>
                            {JSON.stringify(photo.metadata).slice(0, 100)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3 w-full'>
                    <Button
                      variant='outline'
                      className='flex-1'
                      onClick={() => handleDownload(photo)}
                      disabled={isDownloading === photo.id}>
                      <Download className='h-4 w-4 mr-2' />
                      {isDownloading === photo.id ? 'Mengunduh...' : 'Download'}
                    </Button>
                    <Button
                      variant='destructive'
                      className='flex-1'
                      onClick={() => handleDeletePhoto(photo)}>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Hapus
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
