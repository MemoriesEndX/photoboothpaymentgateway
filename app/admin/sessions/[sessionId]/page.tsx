// app/admin/sessions/[sessionId]/page.tsx
// This route redirects to the new admin gallery route
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SessionGalleryRedirect() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string | undefined;

  useEffect(() => {
    if (sessionId) {
      // Redirect to the new gallery route
      router.replace(`/admin/gallery/${encodeURIComponent(sessionId)}`);
    } else {
      // If no sessionId, redirect to sessions list
      router.replace('/admin/sessions');
    }
  }, [sessionId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}

