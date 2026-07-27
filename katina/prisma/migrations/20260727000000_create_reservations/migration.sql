CREATE TABLE "Reservation" (
  "id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "eventNumber" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Reservation_date_eventNumber_key"
  ON "Reservation"("date", "eventNumber");

CREATE INDEX "Reservation_date_idx"
  ON "Reservation"("date");
