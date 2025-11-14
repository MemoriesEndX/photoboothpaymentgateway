import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'
import { URL } from 'url'

type PhotoRecord = { id: number; url?: string | null }

function toPublicFilePath(publicDir: string, url?: string | null): string | null {
  if (!url) return null

  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url)
      const pathname = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname
      return path.resolve(publicDir, pathname)
    }

    const normalized = url.startsWith('/') ? url.slice(1) : url
    return path.resolve(publicDir, normalized)
  } catch {
    return null
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  try {
    return String(err)
  } catch {
    return 'Unknown error'
  }
}

/** Pastikan filepath berada di dalam publicDir */
function isPathInside(parent: string, child: string) {
  const relative = path.relative(parent, child)
  // jika relative dimulai dengan '..' artinya berada di luar parent
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) && !relative.startsWith('')) {
    return false
  }
  return true
}

export async function DELETE() {
  const publicDir = path.resolve(process.cwd(), 'public')
  console.log('🧹 Menghapus semua foto dari DB & public dir:', publicDir)

  try {
    // 1) Ambil semua records dulu (id + url) — Prisma menghasilkan id:number
    const [allPhotos, allSingles, allStrips] = await Promise.all([
      prisma.photo.findMany({ select: { id: true, url: true } }),
      prisma.singlePhoto.findMany({ select: { id: true, url: true } }),
      prisma.stripPhotoOriginal.findMany({ select: { id: true, url: true } }),
    ]) as [PhotoRecord[], PhotoRecord[], PhotoRecord[]] // tipe sesuai hasil select

    const allRecords: { table: string; record: PhotoRecord }[] = []
    allPhotos.forEach((r) => allRecords.push({ table: 'photo', record: r }))
    allSingles.forEach((r) => allRecords.push({ table: 'singlePhoto', record: r }))
    allStrips.forEach((r) => allRecords.push({ table: 'stripPhotoOriginal', record: r }))

    // 2) Attempt to delete files from public for each record
    const fileDeleteResults: {
      id: number
      table: string
      url?: string | null
      filepath?: string | null
      ok: boolean
      error?: string
    }[] = []

    for (const { table, record } of allRecords) {
      const { id, url } = record
      let filepath: string | null = null
      try {
        filepath = toPublicFilePath(publicDir, url)
        if (!filepath) {
          fileDeleteResults.push({ id, table, url, filepath: null, ok: false, error: 'Tidak dapat determinasi path' })
          continue
        }

        // Safety: pastikan file berada di dalam folder public (lebih robust)
        if (!isPathInside(publicDir, filepath)) {
          fileDeleteResults.push({ id, table, url, filepath, ok: false, error: 'Path berada di luar public — dibatalkan' })
          continue
        }

        // Cek file exist lalu hapus
        try {
          await fs.unlink(filepath)
          fileDeleteResults.push({ id, table, url, filepath, ok: true })
        } catch (err) {
          // Jika file tidak ada, anggap sukses karena tujuan bersihkan tetap tercapai
          const msg = getErrorMessage(err)
          if (msg.includes('ENOENT') || (err as any)?.code === 'ENOENT') {
            fileDeleteResults.push({ id, table, url, filepath, ok: true, error: 'File tidak ditemukan (sudah terhapus)' })
          } else {
            fileDeleteResults.push({ id, table, url, filepath, ok: false, error: msg })
          }
        }
      } catch (err) {
        fileDeleteResults.push({ id, table, url, filepath: filepath ?? null, ok: false, error: getErrorMessage(err) })
      }
    }

    // 3) Hapus semua record dari DB
    const [photosDeleted, singleDeleted, stripsDeleted] = await Promise.all([
      prisma.photo.deleteMany(),
      prisma.singlePhoto.deleteMany(),
      prisma.stripPhotoOriginal.deleteMany(),
    ])

    const totalDeleted = (photosDeleted.count || 0) + (singleDeleted.count || 0) + (stripsDeleted.count || 0)

    console.log(`✅ Berhasil menghapus total ${totalDeleted} record.`)

    // ringkasan file delete: hitung berapa ok/gagal
    const fileOk = fileDeleteResults.filter((r) => r.ok).length
    const fileFail = fileDeleteResults.filter((r) => !r.ok).length

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus semua foto (${totalDeleted} record). File-delete: ${fileOk} success, ${fileFail} failed.`,
      deleted: {
        photos: photosDeleted.count,
        singlePhotos: singleDeleted.count,
        stripPhotoOriginals: stripsDeleted.count,
      },
      fileDeleteSummary: {
        totalAttempted: fileDeleteResults.length,
        ok: fileOk,
        failed: fileFail,
        examplesFailed: fileDeleteResults.filter((r) => !r.ok).slice(0, 20),
      },
    })
  } catch (error) {
    console.error('❌ Gagal menghapus semua foto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus semua foto',
        details: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}
