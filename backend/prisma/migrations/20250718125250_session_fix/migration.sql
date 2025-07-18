/*
  Warnings:

  - You are about to drop the column `checkInAt` on the `Stay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stay" DROP COLUMN "checkInAt",
ADD COLUMN     "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
