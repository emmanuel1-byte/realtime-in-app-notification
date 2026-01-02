/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_title_key" ON "Notification"("title");

-- CreateIndex
CREATE INDEX "Notification_title_idx" ON "Notification"("title");
