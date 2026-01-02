/*
  Warnings:

  - You are about to drop the column `noticationId` on the `NotificationRead` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,notificationId]` on the table `NotificationRead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `notificationId` to the `NotificationRead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotificationRead" DROP CONSTRAINT "NotificationRead_noticationId_fkey";

-- DropIndex
DROP INDEX "NotificationRead_userId_noticationId_key";

-- AlterTable
ALTER TABLE "NotificationRead" DROP COLUMN "noticationId",
ADD COLUMN     "notificationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRead_userId_notificationId_key" ON "NotificationRead"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
