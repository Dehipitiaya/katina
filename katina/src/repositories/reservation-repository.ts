import { prisma } from "@/lib/prisma";
import { dateKeyToUtcDate, getMonthRange } from "@/lib/dates";
import type { ReservationCreateInput, ReservationUpdateInput } from "@/validators/reservation";

export async function listReservationsForMonth(year: number, month: number) {
  const { start, end } = getMonthRange(year, month);

  return prisma.reservation.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [{ date: "asc" }, { eventNumber: "asc" }],
  });
}

export async function listReservations() {
  return prisma.reservation.findMany({
    orderBy: [{ date: "desc" }, { eventNumber: "asc" }],
  });
}

export async function listReservationsForBackup() {
  return prisma.reservation.findMany({
    orderBy: [{ date: "asc" }, { eventNumber: "asc" }],
  });
}

export async function listRecentReservations(take = 6) {
  return prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findReservationByDateAndEvent(date: string, eventNumber: number) {
  return prisma.reservation.findUnique({
    where: {
      date_eventNumber: {
        date: dateKeyToUtcDate(date),
        eventNumber,
      },
    },
  });
}

export async function findReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
  });
}

export async function createReservation(input: ReservationCreateInput) {
  return prisma.reservation.create({
    data: {
      date: dateKeyToUtcDate(input.date),
      eventNumber: input.eventNumber,
      name: input.name,
      phone: input.phone,
      batch: input.batch,
      accommodationType: input.accommodationType,
      boardingDetails: input.boardingDetails,
    },
  });
}

export async function updateReservation(
  id: string,
  input: Omit<ReservationUpdateInput, "boardingDetails" | "date"> & {
    date?: string;
    boardingDetails?: string | null;
  },
) {
  const { date, ...rest } = input;

  return prisma.reservation.update({
    where: { id },
    data: {
      ...rest,
      ...(date ? { date: dateKeyToUtcDate(date) } : {}),
    },
  });
}

export async function deleteReservation(id: string) {
  return prisma.reservation.delete({
    where: { id },
  });
}

export async function mergeReservationsFromBackup(
  reservations: Array<{
    id: string;
    date: string;
    eventNumber: number;
    name: string;
    phone: string;
    batch: string;
    accommodationType: string;
    boardingDetails: string | null;
    createdAt: string;
    updatedAt: string;
  }>,
) {
  if (reservations.length === 0) {
    return {
      reservations: await listReservations(),
      importedCount: 0,
      skippedCount: 0,
    };
  }

  const result = await prisma.reservation.createMany({
    data: reservations.map((reservation) => ({
      ...reservation,
      date: dateKeyToUtcDate(reservation.date),
      createdAt: new Date(reservation.createdAt),
      updatedAt: new Date(reservation.updatedAt),
    })),
    skipDuplicates: true,
  });

  return {
    reservations: await listReservations(),
    importedCount: result.count,
    skippedCount: reservations.length - result.count,
  };
}

export async function countReservationsBetween(start: Date, end: Date) {
  return prisma.reservation.count({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
  });
}
