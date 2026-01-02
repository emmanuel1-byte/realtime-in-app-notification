/*
  Warnings:

  - You are about to drop the column `status` on the `UserNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserNotification" DROP COLUMN "status";

-- DropEnum
DROP TYPE "NotificationStatus";
