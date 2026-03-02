-- CreateTable
CREATE TABLE "PlayerGameResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizTitle" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerGameResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerGameResult" ADD CONSTRAINT "PlayerGameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
