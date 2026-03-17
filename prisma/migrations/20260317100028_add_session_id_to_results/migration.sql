-- AlterTable
ALTER TABLE "PlayerGameResult" ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "PlayerGameResult_sessionId_idx" ON "PlayerGameResult"("sessionId");
