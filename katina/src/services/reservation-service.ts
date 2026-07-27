import { endOfMonth, startOfDay, startOfMonth, addDays } from "date-fns";

import { MAX_EVENTS_PER_DAY } from "@/constants/events";
import {
  isAfterReservationEndDate,
  isBeforeReservationStartDate,
  isPastDateKey,
  toDateKey,
} from "@/lib/dates";
import {
  createReservation,
  deleteReservation,
  findReservationByDateAndEvent,
  listRecentReservations,
  listReservations,
  listReservationsForMonth,
  updateReservation,
  countReservationsBetween,
} from "@/repositories/reservation-repository";
import type { ReservationRecord, ReservationSummary } from "@/types/reservation";
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

export async function getRecentAdminReservations() {
  const reservations = await listRecentReservations();
  return reservations.map(toRecord);
}

export async function editReservation(id: string, input: ReservationUpdateInput) {
  const reservation = await updateReservation(id, {
    name: input.name,
    phone: normalizePhone(input.phone),
    batch: input.batch,
    accommodationType: input.accommodationType,
    boardingDetails:
      input.accommodationType === "BOARDING" ? input.boardingDetails : null,
  });

  return toRecord(reservation);
}

export async function removeReservation(id: string) {
  const reservation = await deleteReservation(id);
  return toRecord(reservation);
}

export async function getDashboardStats() {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const monthStart = startOfMonth(today);
  const monthEnd = addDays(endOfMonth(today), 1);
  const currentMonthDays = endOfMonth(today).getDate();
  const totalSlotsThisMonth = currentMonthDays * MAX_EVENTS_PER_DAY;
  const [totalReservations, reservationsToday, reservationsThisMonth] =
    await Promise.all([
      countReservationsBetween(new Date("2020-01-01T00:00:00.000Z"), new Date("2100-01-01T00:00:00.000Z")),
      countReservationsBetween(today, tomorrow),
      countReservationsBetween(monthStart, monthEnd),
    ]);

  return {
    totalReservations,
    reservationsToday,
    reservationsThisMonth,
    availableResponsibilities: Math.max(totalSlotsThisMonth - reservationsThisMonth, 0),
    occupancyPercentage:
      totalSlotsThisMonth === 0
        ? 0
        : Math.round((reservationsThisMonth / totalSlotsThisMonth) * 100),
  };
}
