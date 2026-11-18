ALTER TABLE "Deck" ADD COLUMN "ownerId" TEXT;

CREATE INDEX "Deck_ownerId_updatedAt_idx" ON "Deck"("ownerId", "updatedAt");
