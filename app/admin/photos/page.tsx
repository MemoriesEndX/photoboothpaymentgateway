'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, Trash2, Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface Photo {
  id: string
  url: string
  filename: string
  createdAt: string
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [singlePhotos, setSinglePhotos] = useState<Photo[]>([])
  const [stripPhotos, setStripPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Delete-all related
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/photos/all')
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Gagal memuat data')

        setPhotos(data.photos || [])
        setSinglePhotos(data.singlePhotos || [])
        setStripPhotos(data.stripPhotoOriginals || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalCount = photos.length + singlePhotos.length + stripPhotos.length

  const handleDownload = async (photo: Photo) => {
    try {
      setDownloading(photo.id)
      const r = await fetch(photo.url)
      if (!r.ok) throw new Error('Gagal mengunduh')
      const blob = await r.blob()
      const u = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = photo.filename || `photo-${photo.id}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(u)
      toast({ title: '✅ Berhasil', description: 'Foto berhasil diunduh.' })
    } catch {
      toast({ title: '❌ Gagal', description: 'Download gagal.', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (photo: Photo, type: string) => {
    if (!confirm(`Hapus foto "${photo.filename}"?`)) return
    try {
      setDeleting(photo.id)
      const res = await fetch('/api/gallery/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, type }),
      })
      if (!res.ok) throw new Error('Gagal hapus')

      if (type === 'photo') setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      else if (type === 'singlePhoto') setSinglePhotos((prev) => prev.filter((p) => p.id !== photo.id))
      else setStripPhotos((prev) => prev.filter((p) => p.id !== photo.id))

      toast({ title: '🗑️ Dihapus', description: `${photo.filename} telah dihapus.` })
    } catch {
      toast({ title: '❌ Gagal', description: 'Gagal menghapus foto.', variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  // 🔥 Delete ALL handler: coba endpoint bulk dulu, fallback ke per-item
  const handleDeleteAll = async () => {
    if (totalCount === 0) {
      toast({ title: 'ℹ️ Tidak ada foto', description: 'Tidak ada foto untuk dihapus.' })
      setShowDeleteAllModal(false)
      return
    }

    if (!confirm(`Yakin hapus SEMUA foto (${totalCount})? Tindakan ini tidak bisa dibatalkan.`)) return

    setDeletingAll(true)

    try {
      // coba endpoint bulk
      const res = await fetch('/api/gallery/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        // sukses bulk
        setPhotos([])
        setSinglePhotos([])
        setStripPhotos([])
        toast({ title: '🗑️ Semua Dihapus', description: `${totalCount} foto telah dihapus.` })
        setShowDeleteAllModal(false)
        return
      }

      // fallback: hapus satu per satu (jika bulk tidak tersedia)
      // kumpulkan semua foto dengan tipe masing2
      const items: { photo: Photo; type: string }[] = []
      photos.forEach((p) => items.push({ photo: p, type: 'photo' }))
      singlePhotos.forEach((p) => items.push({ photo: p, type: 'singlePhoto' }))
      stripPhotos.forEach((p) => items.push({ photo: p, type: 'stripPhotoOriginal' }))

      for (const it of items) {
        try {
          const r = await fetch('/api/gallery/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: it.photo.id, type: it.type }),
          })
          if (!r.ok) console.warn('Failed delete', it.photo.id)
        } catch (e) {
          console.warn('Delete error', e)
        }
      }

      // clear local state anyway
      setPhotos([])
      setSinglePhotos([])
      setStripPhotos([])
      toast({ title: '🗑️ Semua Dihapus (partial)', description: 'Proses hapus selesai — beberapa item mungkin gagal.' })
      setShowDeleteAllModal(false)
    } catch (err) {
      console.error(err)
      toast({ title: '❌ Gagal', description: 'Gagal menghapus semua foto.', variant: 'destructive' })
    } finally {
      setDeletingAll(false)
    }
  }

  const renderSection = (title: string, list: Photo[], type: string) => (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {list.length === 0 ? (
        <p className="text-gray-500">Tidak ada foto.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {list.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} className="relative group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer">
                  <Image src={photo.url} alt={photo.filename} width={400} height={400} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
                    <p className="truncate">{photo.filename}</p>
                  </div>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{photo.filename}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                  <img src={photo.url} alt={photo.filename} className="max-h-[70vh] w-full object-contain rounded-lg border" />
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" onClick={() => handleDownload(photo)} disabled={downloading === photo.id}>
                      <Download className="h-4 w-4 mr-2" /> {downloading === photo.id ? 'Mengunduh...' : 'Download'}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(photo, type)} disabled={deleting === photo.id}>
                      <Trash2 className="h-4 w-4 mr-2" /> {deleting === photo.id ? 'Menghapus...' : 'Hapus'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Memuat foto...
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-red-600">
        <AlertTriangle size={32} className="mb-2" />
        <p>{error}</p>
      </div>
    )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">📸 Semua Kategori Foto</h1>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { /* refresh */ window.location.reload() }}>
            Refresh
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteAllModal(true)}
            disabled={totalCount === 0 || deletingAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Semua ({totalCount})
          </Button>
        </div>
      </div>

      {renderSection('📷 Foto Biasa', photos, 'photo')}
      {renderSection('🖼️ Foto Single', singlePhotos, 'singlePhoto')}
      {renderSection('🎞️ Foto Strip', stripPhotos, 'stripPhotoOriginal')}

      {/* Modal sederhana — gunakan Dialog component project-mu kalau mau */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deletingAll && setShowDeleteAllModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus Semua</h3>
            <p className="text-sm text-gray-600 mb-4">Kamu akan menghapus <strong>{totalCount}</strong> foto. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteAllModal(false)} disabled={deletingAll}>Batal</Button>
              <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll}>
                {deletingAll ? 'Menghapus...' : 'Konfirmasi Hapus Semua'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
