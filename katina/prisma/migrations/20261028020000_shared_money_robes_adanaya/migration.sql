-- Let several people share the cost of the වස්සාවාසික සිවුරු and අදනය items,
-- like the කඨින සිවුර. Anyone who already took one of them gives the full amount.
UPDATE "DonationPledge" AS p
SET "amount" = CASE WHEN p."itemId" IN ('sheet-item-071', 'sheet-item-072', 'sheet-item-073') THEN 6400 ELSE 3000 END,
    "updatedAt" = CURRENT_TIMESTAMP
FROM "DonationItem" AS i
WHERE p."itemId" = i."id"
  AND i."type" = 'ITEM'
  AND p."amount" IS NULL
  AND p."itemId" IN ('sheet-item-071', 'sheet-item-072', 'sheet-item-073', 'sheet-item-074', 'sheet-item-075', 'sheet-item-076');

UPDATE "DonationItem"
SET "type" = 'MONEY',
    "targetAmount" = CASE WHEN "id" IN ('sheet-item-071', 'sheet-item-072', 'sheet-item-073') THEN 6400 ELSE 3000 END,
    "unit" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "type" = 'ITEM'
  AND "id" IN ('sheet-item-071', 'sheet-item-072', 'sheet-item-073', 'sheet-item-074', 'sheet-item-075', 'sheet-item-076');
