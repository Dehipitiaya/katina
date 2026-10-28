-- Remove වැව් මාලු කිලො 3 from the goods list.
-- Kept if someone has already signed up for it, so no pledge is lost.
DELETE FROM "DonationItem" AS i
WHERE i."id" = 'sheet-item-005'
  AND NOT EXISTS (SELECT 1 FROM "DonationPledge" AS p WHERE p."itemId" = i."id");
