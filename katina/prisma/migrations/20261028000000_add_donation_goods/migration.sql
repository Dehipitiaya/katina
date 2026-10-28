CREATE TABLE "DonationItem" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "note" TEXT,
  "type" TEXT NOT NULL DEFAULT 'ITEM',
  "targetAmount" DOUBLE PRECISION,
  "unit" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DonationItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DonationItem_sortOrder_idx"
  ON "DonationItem"("sortOrder");

CREATE TABLE "DonationPledge" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "batch" TEXT NOT NULL,
  "faculty" TEXT,
  "amount" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DonationPledge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DonationPledge_itemId_idx"
  ON "DonationPledge"("itemId");

ALTER TABLE "DonationPledge"
  ADD CONSTRAINT "DonationPledge_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "DonationItem"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
