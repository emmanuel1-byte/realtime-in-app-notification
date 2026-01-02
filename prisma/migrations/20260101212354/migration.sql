/*
  Warnings:

  - You are about to drop the column `read` on the `UserNotification` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('READ', 'UNREAD');

-- AlterTable
ALTER TABLE "UserNotification" DROP COLUMN "read",
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD';
