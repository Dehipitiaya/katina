"use client";

import { useMemo, useState, useTransition } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { RESPONSIBILITY_EVENTS, type EventNumber } from "@/constants/events";
import { getHolidayName } from "@/constants/holidays";
import { buildCalendarGrid } from "@/lib/dates";
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
    eventNumber: EventNumber;
  } | null>(null);
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

      <header className="flex justify-center py-8 text-center">
        <h1 className="text-4xl font-semibold tracking-normal text-[#2e1b10] sm:text-6xl dark:text-[#fff2da]">
          අයං වස්සාන කාලෝ
        </h1>
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p>Green is available. Red is already reserved.</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {RESPONSIBILITY_EVENTS.map((event) => (
                <span
                  key={event.number}
                  className="rounded-full border border-white/82 bg-white/18 px-3 py-1 font-medium text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-[30px] dark:border-white/20 dark:bg-white/6 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                >
                  {event.number}. {event.name}
                </span>
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
                  onSelect={(date, eventNumber) => setSelection({ date, eventNumber })}
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
        selection={selection}
        open={Boolean(selection)}
        onOpenChange={(open) => !open && setSelection(null)}
        onReserved={refreshCurrentMonth}
      />
    </section>
  );
}
