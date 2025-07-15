/*
  Warnings:

  - You are about to drop the column `guestPhone` on the `Request` table. All the data in the column will be lost.
  - Added the required column `guestId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "guestPhone",
ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "name" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_telegramId_key" ON "Guest"("telegramId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
