import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64Image, userId, sessionId, metadata, queueNumber } = body;

    console.log('📸 Single photo capture event received:', {
      hasBase64Image: !!base64Image,
      sessionId,
      userId,
      queueNumber,
    });

    if (!base64Image) {
      return NextResponse.json({ error: 'No photo data received' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename using UUID
    const uniqueId = uuidv4();
    const fileName = `single-photo-${uniqueId}-${Date.now()}.jpg`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Create public URL path
    const photoUrl = `/uploads/${fileName}`;

    console.log('💾 Saving single photo to database:', {
      fileName,
      photoUrl,
      sessionId,
    });

    // Save to database using Prisma
    const saved = await prisma.singlePhoto.create({
      data: {
        url: photoUrl,
        userId: userId ? parseInt(userId) : undefined,
        sessionId,
        storagePath: photoUrl,
        filename: fileName,
        metadata: metadata || {},
        queueNumber: queueNumber || 0,
        paid: false,
      },
    });

    console.log('✅ Single photo saved successfully to database:', saved.id);

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil disimpan!',
      data: saved,
    });
  } catch (error) {
    console.error('❌ Error saving single photo:', error);
    return NextResponse.json(
      {
        error: 'Failed to save single photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
