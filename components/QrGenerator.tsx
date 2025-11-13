'use client';

import { useEffect, useState, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QrGeneratorProps {
  sessionId: string;
}

/**
 * QR Code Generator Component
 * Generates a QR code for the current photo booth session
 * Users can scan the QR to view their gallery
 */
export default function QrGenerator({ sessionId }: QrGeneratorProps) {
  const [galleryUrl, setGalleryUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Initialize gallery URL based on session ID
   * Updates automatically when sessionId changes
   */
  useEffect(() => {
    if (sessionId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const url = `${baseUrl}/gallery/${sessionId}`;
      setGalleryUrl(url);
    }
  }, [sessionId]);

  /**
   * Copy gallery URL to clipboard
   */
  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl);
      toast({
        title: '✅ Link Copied!',
        description: 'Gallery URL has been copied to clipboard.',
        duration: 2000,
      });
    } catch {
      toast({
        title: '❌ Copy Failed',
        description: 'Failed to copy URL to clipboard.',
        variant: 'destructive',
      });
    }
  }, [galleryUrl]);

  /**
   * Download QR code as PNG image
   */
  const handleDownloadQR = useCallback(() => {
    try {
      setIsDownloading(true);

      // Get canvas element
      const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('QR Canvas not found');
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-session-${sessionId.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: '✅ QR Code Downloaded!',
          description: 'QR code saved successfully.',
          duration: 2000,
        });
      });
    } catch {
      toast({
        title: '❌ Download Failed',
        description: 'Failed to download QR code.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [sessionId]);

  /**
   * Open gallery in new tab
   */
  const handleOpenGallery = useCallback(() => {
    window.open(galleryUrl, '_blank');
  }, [galleryUrl]);

  if (!sessionId || !galleryUrl) {
    return (
      <Card className='w-full max-w-md mx-auto border-dashed border-2'>
        <CardContent className='flex flex-col items-center justify-center p-8'>
          <RefreshCw className='h-12 w-12 text-gray-300 mb-4 animate-spin' />
          <p className='text-gray-500 text-center'>Waiting for session...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto shadow-lg border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50'>
      <CardHeader className='text-center space-y-2 pb-4'>
        <div className='flex items-center justify-center gap-2'>
          <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' />
          <h3 className='text-xl font-bold text-gray-800'>📱 Scan QR Code</h3>
          <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' />
        </div>
        <p className='text-sm text-gray-600'>
          Scan to view your photo gallery instantly
        </p>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* QR Code Display */}
        <div className='flex justify-center'>
          <div className='relative p-4 bg-white rounded-2xl shadow-xl border-4 border-purple-200'>
            <QRCodeCanvas
              id='qr-canvas'
              value={galleryUrl}
              size={220}
              level='H'
              imageSettings={{
                src: '/logo.png',
                height: 40,
                width: 40,
                excavate: true,
              }}
              className='rounded-lg'
            />
            <div className='absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse' />
          </div>
        </div>

        {/* Session Info */}
        <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
          <div className='flex items-start gap-2'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-purple-700 mb-1'>Session ID:</p>
              <p className='text-sm font-mono text-gray-700 break-all'>{sessionId}</p>
            </div>
          </div>
        </div>

        {/* Gallery URL */}
        <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
          <div className='flex items-start gap-2'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-blue-700 mb-1'>Gallery URL:</p>
              <p className='text-xs font-mono text-gray-600 break-all'>{galleryUrl}</p>
            </div>
            <Button
              onClick={handleCopyUrl}
              size='sm'
              variant='ghost'
              className='flex-shrink-0 hover:bg-blue-100'
              title='Copy URL'>
              <Copy className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-2 gap-3'>
          <Button
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className='bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200'
            size='lg'>
            <Download className='mr-2 h-4 w-4' />
            {isDownloading ? 'Saving...' : 'Download'}
          </Button>

          <Button
            onClick={handleOpenGallery}
            variant='outline'
            className='border-purple-300 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200'
            size='lg'>
            <ExternalLink className='mr-2 h-4 w-4' />
            Open
          </Button>
        </div>

        {/* Instructions */}
        <div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xs'>
              i
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-amber-800 mb-1'>How to use:</p>
              <ul className='text-xs text-amber-700 space-y-1 list-disc list-inside'>
                <li>Scan QR code with your phone camera</li>
                <li>View all photos from this session</li>
                <li>Download or share your memories</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
