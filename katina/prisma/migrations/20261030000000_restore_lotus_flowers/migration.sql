-- Bring back නෙලුම් මල් 500 *30 (deleted by mistake) in its original place,
-- as a shared quantity so several people can each give part of the 500.
INSERT INTO "DonationItem" ("id", "name", "category", "note", "type", "targetAmount", "unit", "sortOrder", "updatedAt")
VALUES ('sheet-item-087', 'නෙලුම් මල් 500 *30', NULL, NULL, 'QUANTITY', 500, NULL, 87, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
