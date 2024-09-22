/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_googleId_key" ON "Conversation"("googleId");
