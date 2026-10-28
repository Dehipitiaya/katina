-- Remove කඨින සිවුර (6400 /=) from the goods list.
-- Kept if someone has already given towards it, so no pledge is lost.
DELETE FROM "DonationItem" AS i
WHERE i."id" = 'sheet-item-070'
  AND NOT EXISTS (SELECT 1 FROM "DonationPledge" AS p WHERE p."itemId" = i."id");
