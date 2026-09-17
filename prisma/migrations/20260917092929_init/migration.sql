-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "personaName" TEXT,
    "avatar" TEXT,
    "rankTier" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchId" BIGINT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "win" BOOLEAN NOT NULL,
    "heroId" INTEGER NOT NULL,
    "lobbyType" INTEGER NOT NULL,
    "gameMode" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "discordWebhookUrl" TEXT NOT NULL,
    "lastNotifiedMatchId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_accountId_key" ON "Player"("accountId");

-- CreateIndex
CREATE INDEX "Match_accountId_startTime_idx" ON "Match"("accountId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Match_accountId_matchId_key" ON "Match"("accountId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_accountId_discordWebhookUrl_key" ON "Subscription"("accountId", "discordWebhookUrl");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Player"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;
