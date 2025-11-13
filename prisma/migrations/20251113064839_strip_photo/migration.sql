-- CreateTable
CREATE TABLE "StripPhotoOriginal" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,
    "sessionId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "packageId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "amountPaid" DECIMAL(10,2),
    "metadata" JSONB,
    "queueNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripPhotoOriginal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StripPhotoOriginal" ADD CONSTRAINT "StripPhotoOriginal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
