// app/api/photos/delete/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, type } = body ?? {}

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    }

    const numericId = Number(id)
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid id (must be numeric)' }, { status: 400 })
    }

    // Helper to remove local file if exists
    const tryRemoveLocalFile = (fileRelPath?: string | null) => {
      if (!fileRelPath) return { ok: false, reason: 'no-path' }
      // normalize leading slash
      const rel = fileRelPath.startsWith('/') ? fileRelPath.slice(1) : fileRelPath
      const filePath = path.join(process.cwd(), 'public', rel)
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          return { ok: true, filePath }
        } else {
          return { ok: true, filePath, note: 'not-found' } // treat not-found as ok (cleanup intent)
        }
      } catch (err) {
        return { ok: false, reason: (err instanceof Error ? err.message : String(err)), filePath }
      }
    }

    // Handle each model explicitly to keep TypeScript happy
    if (type === 'photo') {
      const existing = await prisma.photo.findUnique({
        where: { id: numericId },
        select: { storagePath: true, url: true },
      })
      if (!existing) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

      const deleted = await prisma.photo.delete({ where: { id: numericId } })

      // delete file if we can determine local path
      if (existing.storagePath) tryRemoveLocalFile(existing.storagePath)
      else if (typeof existing.url === 'string' && existing.url.startsWith('/')) tryRemoveLocalFile(existing.url)

      return NextResponse.json({ success: true, deleted })
    }

    if (type === 'singlePhoto') {
      const existing = await prisma.singlePhoto.findUnique({
        where: { id: numericId },
        select: { storagePath: true, url: true },
      })
      if (!existing) return NextResponse.json({ error: 'SinglePhoto not found' }, { status: 404 })

      const deleted = await prisma.singlePhoto.delete({ where: { id: numericId } })

      if (existing.storagePath) tryRemoveLocalFile(existing.storagePath)
      else if (typeof existing.url === 'string' && existing.url.startsWith('/')) tryRemoveLocalFile(existing.url)

      return NextResponse.json({ success: true, deleted })
    }

    if (type === 'stripPhotoOriginal') {
      const existing = await prisma.stripPhotoOriginal.findUnique({
        where: { id: numericId },
        select: { storagePath: true, url: true },
      })
      if (!existing) return NextResponse.json({ error: 'StripPhotoOriginal not found' }, { status: 404 })

      const deleted = await prisma.stripPhotoOriginal.delete({ where: { id: numericId } })

      if (existing.storagePath) tryRemoveLocalFile(existing.storagePath)
      else if (typeof existing.url === 'string' && existing.url.startsWith('/')) tryRemoveLocalFile(existing.url)

      return NextResponse.json({ success: true, deleted })
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
  } catch (err) {
    console.error('❌ Error deleting photo:', err)
    return NextResponse.json(
      {
        error: 'Failed to delete photo',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
