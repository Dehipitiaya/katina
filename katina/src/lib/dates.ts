import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import {
  RESERVATION_END_DATE,
  RESERVATION_START_DATE,
} from "@/constants/reservation-window";

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function dateKeyToUtcDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function normalizeDateKey(date: Date) {
  return toDateKey(startOfDay(date));
}

export function isPastDateKey(dateKey: string) {
  return isBefore(parseISO(dateKey), startOfDay(new Date()));
}

export function isBeforeReservationStartDate(dateKey: string) {
  return isBefore(parseISO(dateKey), parseISO(RESERVATION_START_DATE));
}

export function isAfterReservationEndDate(dateKey: string) {
  return isAfter(parseISO(dateKey), parseISO(RESERVATION_END_DATE));
}

export function getMonthRange(year: number, month: number) {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);

  return {
    start: dateKeyToUtcDate(toDateKey(monthStart)),
    end: dateKeyToUtcDate(toDateKey(addDays(monthEnd, 1))),
    monthStart,
    monthEnd,
  };
}

export function buildCalendarGrid(year: number, month: number) {
  const { monthStart } = getMonthRange(year, month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: isSameMonth(date, monthStart),
      isPast: isPastDateKey(toDateKey(date)),
      isBeforeReservationStart: isBeforeReservationStartDate(toDateKey(date)),
      isAfterReservationEnd: isAfterReservationEndDate(toDateKey(date)),
    };
  });
}
