ALTER TABLE "Reservation" ADD COLUMN "batch" TEXT NOT NULL DEFAULT 'Not provided';
ALTER TABLE "Reservation" ADD COLUMN "accommodationType" TEXT NOT NULL DEFAULT 'HOSTEL';
ALTER TABLE "Reservation" ADD COLUMN "boardingDetails" TEXT;

ALTER TABLE "Reservation" DROP COLUMN "address";
