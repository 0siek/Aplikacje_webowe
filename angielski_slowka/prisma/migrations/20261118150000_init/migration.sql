CREATE TYPE "CardType" AS ENUM ('TRANSLATION', 'DEFINITION');

CREATE TABLE "Deck" (
    "id" UUID NOT NULL,
    "title" VARCHAR(90) NOT NULL,
    "description" VARCHAR(240),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Card" (
    "id" UUID NOT NULL,
    "deckId" UUID NOT NULL,
    "front" VARCHAR(180) NOT NULL,
    "back" VARCHAR(1000) NOT NULL,
    "cardType" "CardType" NOT NULL DEFAULT 'TRANSLATION',
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");

ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
