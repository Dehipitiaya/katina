"use client";

import { useMemo, useState, useTransition } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { RESPONSIBILITY_EVENTS, type EventNumber } from "@/constants/events";
import { getHolidayName } from "@/constants/holidays";
import { buildCalendarGrid } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ReservationSummary } from "@/types/reservation";
import { CalendarDayCard } from "@/features/calendar/components/CalendarDayCard";
import { ReservationDialog } from "@/features/reservation/components/ReservationDialog";

export function PublicCalendar({
  initialReservations,
}: {
  initialReservations: ReservationSummary[];
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const [reservations, setReservations] = useState(initialReservations);
  const [selection, setSelection] = useState<{
    date: string;
    availableEventNumbers: EventNumber[];
  } | null>(null);
  const [highlightedEventNumber, setHighlightedEventNumber] =
    useState<EventNumber | null>(null);
  const [isPending, startTransition] = useTransition();

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const days = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const reservationsByDate = useMemo(() => {
    return reservations.reduce<Record<string, ReservationSummary[]>>(
      (acc, reservation) => {
        acc[reservation.date] = [...(acc[reservation.date] ?? []), reservation];
        return acc;
      },
      {},
    );
  }, [reservations]);

  async function loadMonth(nextCursor: Date) {
    setCursor(nextCursor);
    startTransition(async () => {
      const response = await fetch(
        `/api/calendar?year=${nextCursor.getFullYear()}&month=${nextCursor.getMonth() + 1}`,
      );
      const result = await response.json();

      if (result.success) {
        setReservations(result.data);
      }
    });
  }

  function refreshCurrentMonth() {
    startTransition(async () => {
      const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const result = await response.json();

      if (result.success) {
        setReservations(result.data);
      }
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <a
        href="/admin/login"
        className="fixed right-4 top-4 z-50 inline-flex h-11 items-center gap-2 rounded-full border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-4 text-sm font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_rgba(8,20,40,0.08)] backdrop-blur-[16px] backdrop-saturate-[1.45] transition hover:bg-white/24 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_26px_rgba(0,0,0,0.34)]"
      >
        <ShieldCheck className="size-4" />
        Admin
      </a>

      <header className="flex flex-col items-center justify-center py-8 text-center">
        <h1 className="text-4xl font-semibold tracking-normal text-[#2e1b10] sm:text-6xl dark:text-[#fff2da]">
          අයං වස්සාන කාලෝ
        </h1>
        <p className="mt-3 text-base font-medium text-[#6d5036] sm:text-xl dark:text-[#dbc6aa]">
          (මේ වර්ෂා සමයයි)
        </p>
        <blockquote className="mt-6 max-w-3xl text-lg font-medium leading-8 text-[#3d2415] sm:text-2xl sm:leading-10 dark:text-[#fff2da]">
          &ldquo;කල්ප ලක්ෂයක් ගත වුවද සාංඝික දානයේ විපාක අවසන් නොවේ.&rdquo;
        </blockquote>
        <p className="mt-2 text-sm font-medium text-[#7b5a3b] sm:text-base dark:text-[#cdb390]">
          - භාග්‍යවත් බුදුරජාණන් වහන්සේ -
        </p>
      </header>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),0_18px_46px_rgba(8,20,40,0.10)] backdrop-blur-[16px] backdrop-saturate-[1.45] dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_46px_rgba(0,0,0,0.38)]">
          <GlassButton
            aria-label="Previous month"
            className="size-9 px-0"
            onClick={() => loadMonth(subMonths(cursor, 1))}
          >
            <ChevronLeft className="size-4" />
          </GlassButton>
          <button
            type="button"
            onClick={() => loadMonth(new Date())}
            className="min-w-32 rounded-full px-3 text-center text-xl font-semibold text-[#3d2415] transition hover:text-[#9a541f] dark:text-[#fff2da] dark:hover:text-[#f4c27a]"
          >
            {format(cursor, "MMMM")}
          </button>
          <GlassButton
            aria-label="Next month"
            className="size-9 px-0"
            onClick={() => loadMonth(addMonths(cursor, 1))}
          >
            <ChevronRight className="size-4" />
          </GlassButton>
        </div>
      </div>

      <GlassCard className="p-4 sm:p-6">
        <div className="mb-5 grid gap-4 text-sm text-[#6d5036] dark:text-[#dbc6aa]">
          <div className="grid gap-3 text-center">
            <p>Green is available. Red is already reserved.</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {RESPONSIBILITY_EVENTS.map((event) => (
                <button
                  type="button"
                  key={event.number}
                  onClick={() =>
                    setHighlightedEventNumber((current) =>
                      current === event.number ? null : event.number,
                    )
                  }
                  aria-pressed={highlightedEventNumber === event.number}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.30),0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-[16px] backdrop-saturate-[1.35] transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30",
                    highlightedEventNumber === event.number
                      ? "border-[#fff2da]/80 bg-[#fff2da]/22 text-white"
                      : "border-white/40 bg-white/12 text-[#fff2da] hover:bg-white/18",
                  )}
                >
                  {event.number}. {event.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-xs font-medium text-[#7b5a3b] sm:grid-cols-7 dark:text-[#cdb390]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day} className="hidden px-2 sm:block">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day) => (
            (() => {
              const holidayName = getHolidayName(day.dateKey);
              const weekday = day.date.getDay();
              const dayTone = holidayName
                ? "holiday"
                : weekday === 6
                  ? "saturday"
                  : weekday === 0
                    ? "sunday"
                    : "weekday";

              return (
                <CalendarDayCard
                  key={day.dateKey}
                  date={day.date}
                  dateKey={day.dateKey}
                  reservations={reservationsByDate[day.dateKey] ?? []}
                  isCurrentMonth={day.isCurrentMonth}
                  isPast={day.isPast}
                  isBeforeReservationStart={day.isBeforeReservationStart}
                  isAfterReservationEnd={day.isAfterReservationEnd}
                  dayTone={dayTone}
                  holidayName={holidayName}
                  highlightedEventNumber={highlightedEventNumber}
                  onSelectDay={(date, availableEventNumbers) =>
                    setSelection({ date, availableEventNumbers })
                  }
                />
              );
            })()
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          {isPending && <span className="px-3 py-1">Updating calendar...</span>}
        </div>
      </GlassCard>

      <ReservationDialog
        key={selection?.date ?? "closed"}
        selection={selection}
        open={Boolean(selection)}
        onOpenChange={(open) => !open && setSelection(null)}
        onReserved={refreshCurrentMonth}
      />
    </section>
  );
}
