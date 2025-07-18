/*
  Warnings:

  - You are about to drop the column `checkInAt` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `guestId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `stayId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_guestId_fkey";

-- AlterTable
ALTER TABLE "Guest" DROP COLUMN "checkInAt",
DROP COLUMN "roomNumber";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "guestId",
ADD COLUMN     "stayId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stay" ADD CONSTRAINT "Stay_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
