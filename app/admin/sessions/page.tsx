// app/admin/sessions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SessionSummary, SessionsResponse } from '@/types/photo';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/sessions');
        const data: SessionsResponse = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal memuat session');
        }
        if (!mounted) return;
        setSessions(data.sessions);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-500">Memuat sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-semibold">❌ Error</p>
            <p className="text-red-800 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-gray-700">Belum ada session</p>
            <p className="text-gray-500 mt-2">
              Session akan muncul ketika ada foto yang diupload.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🎞️ Photo Sessions</h1>
        <p className="text-gray-500 mt-2">Daftar semua session foto yang tersimpan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Link
            key={session.sessionId}
            href={`/admin/gallery/${encodeURIComponent(session.sessionId)}`}
          >
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      📸 Session
                    </h3>
                    <p className="text-sm text-gray-600 mb-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {session.sessionId}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(session.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white transition-all">
                      Lihat →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
