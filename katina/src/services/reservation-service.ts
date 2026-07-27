import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { MAX_EVENTS_PER_DAY } from "@/constants/events";
import {
  RESERVATION_END_DATE,
  RESERVATION_START_DATE,
} from "@/constants/reservation-window";
import {
  dateKeyToUtcDate,
  isAfterReservationEndDate,
  isBeforeReservationStartDate,
  isPastDateKey,
  toDateKey,
} from "@/lib/dates";
import {
  createReservation,
  deleteReservation,
  findReservationByDateAndEvent,
  findReservationById,
  listRecentReservations,
  listReservations,
  listReservationsForBackup,
  listReservationsForMonth,
  mergeReservationsFromBackup,
  updateReservation,
  countReservationsBetween,
} from "@/repositories/reservation-repository";
import type { ReservationRecord, ReservationSummary } from "@/types/reservation";
import type { BackupFileInput } from "@/validators/backup";
import type { ReservationCreateInput, ReservationUpdateInput } from "@/validators/reservation";

function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return `${plus}${trimmed.replace(/[^\d]/g, "")}`;
}

function toSummary(reservation: {
  id: string;
  date: Date;
  eventNumber: number;
  createdAt: Date;
}): ReservationSummary {
  return {
    id: reservation.id,
    date: toDateKey(reservation.date),
    eventNumber: reservation.eventNumber as ReservationSummary["eventNumber"],
    createdAt: reservation.createdAt.toISOString(),
  };
}

function toRecord(reservation: {
  id: string;
  date: Date;
  eventNumber: number;
  name: string;
  phone: string;
  batch: string;
  accommodationType: string;
  boardingDetails: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ReservationRecord {
  return {
    ...toSummary(reservation),
    name: reservation.name,
    phone: reservation.phone,
    batch: reservation.batch,
    accommodationType:
      reservation.accommodationType as ReservationRecord["accommodationType"],
    boardingDetails: reservation.boardingDetails,
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

export async function getCalendarReservations(year: number, month: number) {
  const reservations = await listReservationsForMonth(year, month);
  return reservations.map(toSummary);
}

export async function reserveResponsibility(input: ReservationCreateInput) {
  if (isPastDateKey(input.date)) {
    throw new Error("Past dates cannot be reserved.");
  }

  if (isBeforeReservationStartDate(input.date)) {
    throw new Error("Reservations are only available from July 29, 2026.");
  }

  if (isAfterReservationEndDate(input.date)) {
    throw new Error("Reservations are only available up to October 25, 2026.");
  }

  const existing = await findReservationByDateAndEvent(input.date, input.eventNumber);

  if (existing) {
    throw new Error("This responsibility has already been reserved.");
  }

  const reservation = await createReservation({
    ...input,
    phone: normalizePhone(input.phone),
    boardingDetails:
      input.accommodationType === "BOARDING" ? input.boardingDetails : undefined,
  });

  return toSummary(reservation);
}

export async function getAdminReservations() {
  const reservations = await listReservations();
  return reservations.map(toRecord);
}

export async function createReservationsBackup() {
  const reservations = await listReservationsForBackup();

  return {
    app: "katina-responsibility-calendar" as const,
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    reservations: reservations.map(toRecord),
  };
}

export async function restoreReservationsBackup(input: BackupFileInput) {
  const result = await mergeReservationsFromBackup(input.reservations);

  return {
    reservations: result.reservations.map(toRecord),
    importedCount: result.importedCount,
    skippedCount: result.skippedCount,
  };
}

export async function getRecentAdminReservations() {
  const reservations = await listRecentReservations();
  return reservations.map(toRecord);
}

export async function editReservation(id: string, input: ReservationUpdateInput) {
  const current = await findReservationById(id);

  if (!current) {
    throw new Error("Reservation not found.");
  }

  const nextDate = input.date ?? toDateKey(current.date);
  const nextEventNumber = input.eventNumber ?? current.eventNumber;
  const existing = await findReservationByDateAndEvent(nextDate, nextEventNumber);

  if (existing && existing.id !== id) {
    throw new Error("That date and event already has a reservation.");
  }

  const reservation = await updateReservation(id, {
    ...(input.date ? { date: input.date } : {}),
    ...(input.eventNumber ? { eventNumber: input.eventNumber } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.phone ? { phone: normalizePhone(input.phone) } : {}),
    ...(input.batch ? { batch: input.batch } : {}),
    ...(input.accommodationType
      ? { accommodationType: input.accommodationType }
      : {}),
    boardingDetails:
      input.accommodationType === "HOSTEL"
        ? null
        : input.boardingDetails === undefined
          ? undefined
          : input.boardingDetails,
  });

  return toRecord(reservation);
}

export async function removeReservation(id: string) {
  const reservation = await deleteReservation(id);
  return toRecord(reservation);
}

export async function getDashboardStats() {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = addDays(endOfMonth(today), 1);
  const reservationStart = parseISO(RESERVATION_START_DATE);
  const reservationEnd = parseISO(RESERVATION_END_DATE);
  const activeStart = isBefore(today, reservationStart) ? reservationStart : today;
  const hasActiveWindow = !isAfter(activeStart, reservationEnd);
  const availableWindowDays = hasActiveWindow
    ? differenceInCalendarDays(reservationEnd, activeStart) + 1
    : 0;
  const availableWindowSlots = availableWindowDays * MAX_EVENTS_PER_DAY;
  const fullWindowDays =
    differenceInCalendarDays(reservationEnd, reservationStart) + 1;
  const fullWindowSlots = fullWindowDays * MAX_EVENTS_PER_DAY;
  const [totalReservations, reservationsThisMonth, reservationsInActiveWindow] =
    await Promise.all([
      countReservationsBetween(
        dateKeyToUtcDate(RESERVATION_START_DATE),
        dateKeyToUtcDate(toDateKey(addDays(reservationEnd, 1))),
      ),
      countReservationsBetween(monthStart, monthEnd),
      hasActiveWindow
        ? countReservationsBetween(
            dateKeyToUtcDate(toDateKey(activeStart)),
            dateKeyToUtcDate(toDateKey(addDays(reservationEnd, 1))),
          )
        : Promise.resolve(0),
    ]);

  return {
    totalReservations,
    reservationsToday: 0,
    reservationsThisMonth,
    availableResponsibilities: Math.max(
      availableWindowSlots - reservationsInActiveWindow,
      0,
    ),
    occupancyPercentage:
      fullWindowSlots === 0
        ? 0
        : Math.round((totalReservations / fullWindowSlots) * 100),
  };
}
