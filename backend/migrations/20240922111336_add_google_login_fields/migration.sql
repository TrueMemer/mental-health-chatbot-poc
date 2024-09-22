/*
  Warnings:

  - You are about to drop the column `googleId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conversation_googleId_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "googleId",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
