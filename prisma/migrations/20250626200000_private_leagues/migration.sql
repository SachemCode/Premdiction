-- CreateTable
CREATE TABLE "private_leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_league_members" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_league_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_league_competitions" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 2026,

    CONSTRAINT "private_league_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "private_leagues_slug_key" ON "private_leagues"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "private_leagues_inviteCode_key" ON "private_leagues"("inviteCode");

-- CreateIndex
CREATE INDEX "private_leagues_createdById_idx" ON "private_leagues"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "private_league_members_leagueId_userId_key" ON "private_league_members"("leagueId", "userId");

-- CreateIndex
CREATE INDEX "private_league_members_userId_idx" ON "private_league_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "private_league_competitions_leagueId_competition_season_key" ON "private_league_competitions"("leagueId", "competition", "season");

-- AddForeignKey
ALTER TABLE "private_league_members" ADD CONSTRAINT "private_league_members_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "private_leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_league_competitions" ADD CONSTRAINT "private_league_competitions_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "private_leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
