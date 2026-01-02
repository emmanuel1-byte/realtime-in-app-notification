/*
  Warnings:

  - Added the required column `delivered` to the `UserNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `read` to the `UserNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserNotification" ADD COLUMN     "delivered" BOOLEAN NOT NULL,
ADD COLUMN     "read" BOOLEAN NOT NULL;
