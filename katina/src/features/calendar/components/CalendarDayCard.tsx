"use client";

import type { KeyboardEvent } from "react";
import { format } from "date-fns";

import { EVENT_NUMBERS, RESPONSIBILITY_EVENTS, type EventNumber } from "@/constants/events";
import { cn } from "@/lib/utils";
import type { ReservationSummary } from "@/types/reservation";

export function CalendarDayCard({
  date,
  dateKey,
  reservations,
  isCurrentMonth,
  isPast,
  isBeforeReservationStart,
  isAfterReservationEnd,
  onSelectDay,
  dayTone,
  holidayName,
  highlightedEventNumber,
}: {
  date: Date;
  dateKey: string;
  reservations: ReservationSummary[];
  isCurrentMonth: boolean;
  isPast: boolean;
  isBeforeReservationStart: boolean;
  isAfterReservationEnd: boolean;
  dayTone: "weekday" | "saturday" | "sunday" | "holiday";
  holidayName: string | null;
  highlightedEventNumber: EventNumber | null;
  onSelectDay: (dateKey: string, availableEventNumbers: EventNumber[]) => void;
}) {
  const reservedEvents = new Set(reservations.map((reservation) => reservation.eventNumber));
  const isOutsideMonth = !isCurrentMonth;
  const isMuted =
    isPast || isBeforeReservationStart || isAfterReservationEnd || isOutsideMonth;
  const isFullyReserved = !isMuted && reservedEvents.size === EVENT_NUMBERS.length;
  const availableEventNumbers = EVENT_NUMBERS.filter(
    (eventNumber) => !reservedEvents.has(eventNumber),
  );
  const canReserveDay = !isMuted && availableEventNumbers.length > 0;
  const isHighlightedDay =
    highlightedEventNumber !== null &&
    canReserveDay &&
    availableEventNumbers.includes(highlightedEventNumber);

  function openDayReservation() {
    if (canReserveDay) {
      onSelectDay(dateKey, availableEventNumbers);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.key === "Enter" || event.key === " ") && canReserveDay) {
      event.preventDefault();
      openDayReservation();
    }
  }

  if (isOutsideMonth) {
    return (
      <div
        aria-hidden="true"
        className="min-h-28 rounded-[24px] border border-white/22 bg-white/[0.04] dark:border-white/[0.04] dark:bg-white/[0.015]"
      />
    );
  }

  return (
    <div
      role={canReserveDay ? "button" : undefined}
      tabIndex={canReserveDay ? 0 : undefined}
      onClick={openDayReservation}
      onKeyDown={handleKeyDown}
      aria-label={
        canReserveDay
          ? `Reserve responsibilities on ${format(date, "MMMM d")}`
          : undefined
      }
      className={cn(
        "group relative min-h-28 overflow-hidden rounded-[24px] border p-3 backdrop-blur-[16px] backdrop-saturate-[1.55] transition duration-200 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-white/74 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_27%,rgba(255,255,255,0.050)_50%,transparent_55%,rgba(255,255,255,0.055)_100%)] after:opacity-80 hover:-translate-y-0.5 dark:before:bg-white/22 dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),transparent_27%,rgba(255,255,255,0.034)_50%,transparent_55%,rgba(255,255,255,0.035)_100%)]",
        canReserveDay && "cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/35",
        isMuted
          ? "border-2 border-slate-500/80 bg-[linear-gradient(180deg,rgba(148,163,184,0.30),rgba(51,65,85,0.18))] text-slate-600 shadow-none grayscale hover:translate-y-0 dark:border-slate-500/70 dark:bg-[linear-gradient(180deg,rgba(100,116,139,0.22),rgba(15,23,42,0.15))] dark:text-slate-500"
        : isFullyReserved
            ? "border-[3px] border-[#a58cff] bg-[linear-gradient(180deg,rgba(165,140,255,0.18),rgba(89,80,210,0.075)_48%,rgba(255,255,255,0.055))] shadow-[inset_0_1px_0_rgba(255,255,255,0.74),inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_2px_rgba(165,140,255,0.28),0_14px_34px_rgba(89,80,210,0.20)] dark:border-[#a58cff] dark:bg-[linear-gradient(180deg,rgba(165,140,255,0.16),rgba(89,80,210,0.070)_48%,rgba(255,255,255,0.030))] dark:shadow-[0_0_0_2px_rgba(165,140,255,0.26),0_12px_30px_rgba(0,0,0,0.28)]"
          : dayTone === "holiday"
            ? "border-[3px] border-[#f4c27a] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(244,194,122,0.20),0_10px_26px_rgba(244,194,122,0.12)] dark:border-[#f4c27a] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(244,194,122,0.18),0_12px_30px_rgba(0,0,0,0.26)]"
          : dayTone === "saturday"
            ? "border-[3px] border-[#8dc5df] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(141,197,223,0.18),0_10px_26px_rgba(141,197,223,0.10)] dark:border-[#8dc5df] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(141,197,223,0.16),0_12px_30px_rgba(0,0,0,0.26)]"
          : dayTone === "sunday"
            ? "border-[3px] border-[#ff8a70] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(255,138,112,0.18),0_10px_26px_rgba(255,138,112,0.10)] dark:border-[#ff8a70] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(255,138,112,0.16),0_12px_30px_rgba(0,0,0,0.26)]"
          : isCurrentMonth
          ? "border-white/54 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.030)_48%,rgba(255,255,255,0.075))] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_0_0_1px_rgba(255,255,255,0.09),0_10px_26px_rgba(8,20,40,0.08)] dark:border-white/18 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(255,255,255,0.012)_48%,rgba(255,255,255,0.028))] dark:shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
          : "border-white/40 bg-white/20 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] dark:border-white/10 dark:bg-white/5 dark:text-slate-600",
        isHighlightedDay &&
          "border-white/95 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.08))] ring-4 ring-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.90),inset_0_0_0_1px_rgba(255,255,255,0.24),0_0_0_2px_rgba(255,255,255,0.28),0_0_42px_rgba(255,255,255,0.34),0_14px_34px_rgba(0,0,0,0.20)]",
      )}
    >
      {isHighlightedDay && (
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent_58%,rgba(255,255,255,0.10))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.38)]" />
      )}
      {isFullyReserved && (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_8px,rgba(255,255,255,0.18)_9px,rgba(255,255,255,0.18)_10px),repeating-linear-gradient(45deg,transparent_0px,transparent_11px,rgba(165,140,255,0.20)_12px,rgba(165,140,255,0.20)_13px)] opacity-70" />
      )}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#2e1b10] dark:text-[#fff2da]">{format(date, "d")}</p>
          <p className="text-[11px] text-[#7b5a3b] dark:text-[#cdb390]">{format(date, "EEE")}</p>
        </div>
        <div
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[12px]",
            isMuted
              ? "border-white/10 bg-white/5 text-white/40"
              : isFullyReserved
                ? "border-[#a58cff]/50 bg-[#a58cff]/14 text-[#e3dcff]"
                : "border-[#b6e56f]/42 bg-[#b6e56f]/12 text-[#dff7b8]",
          )}
          title={
            isMuted
              ? "Reservations unavailable"
              : `${availableEventNumbers.length} of ${EVENT_NUMBERS.length} available`
          }
        >
          {isMuted
            ? "Closed"
            : isFullyReserved
              ? "Full"
              : `${availableEventNumbers.length}/${EVENT_NUMBERS.length} open`}
        </div>
      </div>
      {holidayName && !isMuted && (
        <p className="relative z-10 mt-2 truncate text-[10px] font-medium text-[#9a541f] dark:text-[#f4c27a]">
          {holidayName}
        </p>
      )}

      <div className={cn("relative z-10 grid grid-cols-4 gap-1.5", holidayName && !isMuted ? "mt-2" : "mt-4")}>
        {RESPONSIBILITY_EVENTS.map((event) => {
          const reserved = reservedEvents.has(event.number);
          const disabled =
            reserved ||
            isPast ||
            isBeforeReservationStart ||
            isAfterReservationEnd ||
            !isCurrentMonth;
          return (
            <div
              key={event.number}
              aria-hidden="true"
              className={cn(
                "flex h-8 items-center justify-center rounded-full border px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#007aff]/20",
                reserved &&
                  "border-[#ff6b4a]/52 bg-[linear-gradient(180deg,rgba(255,107,74,0.42),rgba(200,47,34,0.32))] text-white shadow-[inset_0_1px_0_rgba(255,238,220,0.34),0_0_10px_rgba(255,80,58,0.16)] dark:border-[#ff8a70]/52 dark:bg-[linear-gradient(180deg,rgba(255,107,74,0.38),rgba(200,47,34,0.30))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_10px_rgba(255,80,58,0.16)]",
                !reserved &&
                  !disabled &&
                  "border-[#b6e56f]/52 bg-[linear-gradient(180deg,rgba(182,229,111,0.42),rgba(95,159,60,0.32))] text-[#10220b] shadow-[inset_0_1px_0_rgba(255,245,225,0.34),0_0_10px_rgba(90,200,90,0.14)] hover:bg-[#5f8c45]/26 dark:border-[#b6e56f]/52 dark:bg-[linear-gradient(180deg,rgba(182,229,111,0.38),rgba(95,159,60,0.30))] dark:text-[#081405] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_10px_rgba(90,200,90,0.14)]",
                (isPast || isBeforeReservationStart || isAfterReservationEnd) &&
                  "border-slate-300/70 bg-slate-200/42 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] dark:border-white/8 dark:bg-white/5 dark:text-slate-600",
                disabled &&
                  !isPast &&
                  !isBeforeReservationStart &&
                  !isAfterReservationEnd &&
                  !reserved &&
                  "border-white/42 bg-white/18 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] dark:border-white/10 dark:bg-white/5 dark:text-slate-600",
              )}
            >
              <span>{event.number}</span>
              <span className="sr-only">
                {event.name}{" "}
                {isPast
                  ? "past"
                  : isBeforeReservationStart
                    ? "not open yet"
                  : isAfterReservationEnd
                    ? "closed"
                    : reserved
                      ? "taken"
                      : "open"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
