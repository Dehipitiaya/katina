"use client";

import { format } from "date-fns";

import { EVENT_NUMBERS, RESPONSIBILITY_EVENTS, type EventNumber } from "@/constants/events";
import { cn } from "@/lib/utils";
import type { ReservationSummary } from "@/types/reservation";
import { AvailabilityIndicator } from "@/features/calendar/components/AvailabilityIndicator";

export function CalendarDayCard({
  date,
  dateKey,
  reservations,
  isCurrentMonth,
  isPast,
  isBeforeReservationStart,
  isAfterReservationEnd,
  onSelect,
  dayTone,
  holidayName,
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
  onSelect: (dateKey: string, eventNumber: EventNumber) => void;
}) {
  const reservedEvents = new Set(reservations.map((reservation) => reservation.eventNumber));
  const isOutsideMonth = !isCurrentMonth;
  const isMuted =
    isPast || isBeforeReservationStart || isAfterReservationEnd || isOutsideMonth;
  const isFullyReserved = !isMuted && reservedEvents.size === EVENT_NUMBERS.length;

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
      className={cn(
        "group relative min-h-28 overflow-hidden rounded-[24px] border p-3 backdrop-blur-[16px] backdrop-saturate-[1.55] transition duration-200 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-white/74 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_27%,rgba(255,255,255,0.050)_50%,transparent_55%,rgba(255,255,255,0.055)_100%)] after:opacity-80 hover:-translate-y-0.5 dark:before:bg-white/22 dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),transparent_27%,rgba(255,255,255,0.034)_50%,transparent_55%,rgba(255,255,255,0.035)_100%)]",
        isMuted
          ? "border-2 border-slate-500/80 bg-[linear-gradient(180deg,rgba(148,163,184,0.30),rgba(51,65,85,0.18))] text-slate-600 shadow-none grayscale hover:translate-y-0 dark:border-slate-500/70 dark:bg-[linear-gradient(180deg,rgba(100,116,139,0.22),rgba(15,23,42,0.15))] dark:text-slate-500"
        : isFullyReserved
            ? "border-[3px] border-[#ff6b4a] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.10))] shadow-[inset_0_1px_0_rgba(255,255,255,0.74),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(255,80,58,0.30),0_14px_34px_rgba(255,80,58,0.20)] dark:border-[#ff8a70] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(255,138,112,0.24),0_12px_30px_rgba(0,0,0,0.30)]"
          : dayTone === "holiday"
            ? "border-[3px] border-[#f4c27a] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(244,194,122,0.20),0_10px_26px_rgba(244,194,122,0.12)] dark:border-[#f4c27a] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(244,194,122,0.18),0_12px_30px_rgba(0,0,0,0.26)]"
          : dayTone === "saturday"
            ? "border-[3px] border-[#8dc5df] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(141,197,223,0.18),0_10px_26px_rgba(141,197,223,0.10)] dark:border-[#8dc5df] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(141,197,223,0.16),0_12px_30px_rgba(0,0,0,0.26)]"
          : dayTone === "sunday"
            ? "border-[3px] border-[#ff8a70] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_0_2px_rgba(255,138,112,0.18),0_10px_26px_rgba(255,138,112,0.10)] dark:border-[#ff8a70] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.014)_48%,rgba(255,255,255,0.032))] dark:shadow-[0_0_0_2px_rgba(255,138,112,0.16),0_12px_30px_rgba(0,0,0,0.26)]"
          : isCurrentMonth
          ? "border-white/54 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.030)_48%,rgba(255,255,255,0.075))] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_0_0_1px_rgba(255,255,255,0.09),0_10px_26px_rgba(8,20,40,0.08)] dark:border-white/18 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(255,255,255,0.012)_48%,rgba(255,255,255,0.028))] dark:shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
          : "border-white/40 bg-white/20 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] dark:border-white/10 dark:bg-white/5 dark:text-slate-600",
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#2e1b10] dark:text-[#fff2da]">{format(date, "d")}</p>
          <p className="text-[11px] text-[#7b5a3b] dark:text-[#cdb390]">{format(date, "EEE")}</p>
        </div>
        <div className="flex w-20 gap-1 pt-1">
          {EVENT_NUMBERS.map((eventNumber) => (
            <AvailabilityIndicator
              key={eventNumber}
              reserved={reservedEvents.has(eventNumber)}
              label={`${RESPONSIBILITY_EVENTS[eventNumber - 1].name} ${
                reservedEvents.has(eventNumber) ? "reserved" : "available"
              }`}
              muted={isMuted}
            />
          ))}
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
            <button
              key={event.number}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateKey, event.number)}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
