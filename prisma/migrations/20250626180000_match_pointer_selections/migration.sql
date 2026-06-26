-- CreateTable
CREATE TABLE "match_pointer_selections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "selectedPointers" TEXT[],
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pointer_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_pointer_selections_userId_matchId_key" ON "match_pointer_selections"("userId", "matchId");

-- CreateIndex
CREATE INDEX "match_pointer_selections_matchId_idx" ON "match_pointer_selections"("matchId");

-- CreateIndex
CREATE INDEX "match_pointer_selections_userId_idx" ON "match_pointer_selections"("userId");
