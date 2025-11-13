-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'GUEST');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GUEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
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

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SinglePhoto" (
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

    CONSTRAINT "SinglePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SinglePhoto" ADD CONSTRAINT "SinglePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
