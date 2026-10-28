-- Remove මස් කිලො 3, කිරි මාලු කිලො 3, බිත්තර 30 and කරවල කිලො 1.5 from the goods list.
-- An item someone has already signed up for is kept, so no pledge is lost.
DELETE FROM "DonationItem" AS i
WHERE i."id" IN ('sheet-item-018', 'sheet-item-019', 'sheet-item-020', 'sheet-item-023')
  AND NOT EXISTS (SELECT 1 FROM "DonationPledge" AS p WHERE p."itemId" = i."id");
