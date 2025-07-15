-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_guestId_fkey";

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
