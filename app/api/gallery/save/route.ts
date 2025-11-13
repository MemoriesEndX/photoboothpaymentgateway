import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // Parse JSON body instead of formData
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format", details: parseError instanceof Error ? parseError.message : "Unknown error" },
        { status: 400 }
      );
    }

    const { userId, sessionId, base64Image, metadata } = body;

    console.log("Received request:", {
      hasUserId: !!userId,
      hasSessionId: !!sessionId,
      hasBase64Image: !!base64Image,
      base64Length: base64Image?.length,
      metadata,
    });

    // Validate required fields
    if (!base64Image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with timestamp
    const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(uploadDir, filename);
    
    // Write file to disk
    await writeFile(filePath, buffer);

    // Create public URL path
    const storagePath = `/uploads/${filename}`;

    // Get current queue number for this session
    const currentQueue = await prisma.photo.count({ where: { sessionId } });

    // Prepare photo data
    const photoData = {
      sessionId,
      storagePath,
      filename,
      url: storagePath, // URL field from schema
      metadata: metadata || {},
      queueNumber: currentQueue + 1,
      ...(userId && { userId: parseInt(userId) }), // Only add userId if it exists
    };

    // Save photo data to database
    const photo = await prisma.photo.create({
      data: photoData as Prisma.PhotoUncheckedCreateInput,
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Error saving photo:", error);
    return NextResponse.json(
      { 
        error: "Failed to save photo", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
