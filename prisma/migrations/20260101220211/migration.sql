/*
  Warnings:

  - The values [DOWNLOAD_NOTFICATION,COMMENT_NOTIFICATION,WELCOME_NOTIFICATION] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('RECIPE_CREATED_NOT', 'RECIPE_UPDATED_NOT', 'RECIPE_DELETED_NOT', 'WELCOME_NOT');
ALTER TABLE "NotificationPrefrence" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
