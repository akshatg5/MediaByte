/*
  Warnings:

  - Added the required column `uploadedById` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "uploadedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
