import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { photo, sessionId, template, userId, metadata } = body;

    console.log('📸 Saving strip photo to gallery...', {
      hasPhoto: !!photo,
      sessionId,
      template,
    });

    if (!photo) {
      return NextResponse.json({ error: 'No photo data provided' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Generate filename with sessionId and timestamp
    const timestamp = Date.now();
    const filename = `strip_original_${sessionId}_${timestamp}.jpg`;

    // Remove data URL prefix if present
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create gallery directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'gallery');
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Create public URL path
    const photoUrl = `/gallery/${filename}`;

    console.log('💾 Saving strip photo to database:', {
      filename,
      photoUrl,
      sessionId,
      template,
    });

    // Get current queue number for this session
    const currentQueue = await prisma.stripPhotoOriginal.count({
      where: { sessionId },
    });

    // Save to database
    const savedStrip = await prisma.stripPhotoOriginal.create({
      data: {
        url: photoUrl,
        userId: userId ? parseInt(userId) : undefined,
        sessionId,
        storagePath: photoUrl,
        filename,
        thumbnailPath: template || null, // Jenis template (4x1, 3x3, dll)
        metadata: metadata || {},
        queueNumber: currentQueue + 1,
        paid: false,
      },
    });

    console.log('✅ Strip photo saved successfully:', savedStrip.id);

    return NextResponse.json({
      success: true,
      message: 'Strip photo saved successfully!',
      data: savedStrip,
      filePath: photoUrl,
    });
  } catch (error) {
    console.error('❌ Error saving strip photo:', error);
    return NextResponse.json(
      {
        error: 'Failed to save strip photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
