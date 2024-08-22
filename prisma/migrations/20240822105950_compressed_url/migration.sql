/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "compressedUrl" TEXT,
ALTER COLUMN "compressedSize" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Video_publicId_key" ON "Video"("publicId");
