/*
  Warnings:

  - You are about to drop the `NotificationRead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotificationRead" DROP CONSTRAINT "NotificationRead_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRead" DROP CONSTRAINT "NotificationRead_userId_fkey";

-- AlterTable
ALTER TABLE "UserNotification" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "NotificationRead";
