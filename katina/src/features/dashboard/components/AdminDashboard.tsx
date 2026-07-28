"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Home,
  LogOut,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { EVENT_NUMBERS, RESPONSIBILITY_EVENTS } from "@/constants/events";
import { cn } from "@/lib/utils";
import type { DashboardStats, ReservationRecord } from "@/types/reservation";
import { StatCard } from "@/features/dashboard/components/StatCard";

export function AdminDashboard({
  stats,
  reservations,
}: {
  stats: DashboardStats;
  reservations: ReservationRecord[];
}) {
  const router = useRouter();
  const [records, setRecords] = useState(reservations);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReservationRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<ReservationRecord | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({
    date: "",
    eventNumber: 1,
    name: "",
    phone: "",
    batch: "",
    accommodationType: "HOSTEL" as "HOSTEL" | "BOARDING",
    boardingDetails: "",
  });

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const needleDigits = query.replace(/[^\d]/g, "");

    return records
      .filter((record) => {
        const phoneDigits = record.phone.replace(/[^\d]/g, "");
        const matchesQuery =
          !needle ||
          record.name.toLowerCase().includes(needle) ||
          record.batch.toLowerCase().includes(needle) ||
          record.phone.toLowerCase().includes(needle) ||
          Boolean(needleDigits && phoneDigits.includes(needleDigits));
        const matchesDate = !filterDate || record.date === filterDate;
        const matchesMonth = !filterMonth || record.date.startsWith(filterMonth);
        const matchesEvent =
          !filterEvent || record.eventNumber === Number(filterEvent);

        return matchesQuery && matchesDate && matchesMonth && matchesEvent;
      })
      .sort((first, second) => {
        const dateOrder = first.date.localeCompare(second.date);

        if (dateOrder !== 0) {
          return dateOrder;
        }

        return first.eventNumber - second.eventNumber;
      });
  }, [records, query, filterDate, filterMonth, filterEvent]);

  const searchSuggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const needleDigits = query.replace(/[^\d]/g, "");

    if (!needle) {
      return [];
    }

    return records
      .filter((record) => {
        const phoneDigits = record.phone.replace(/[^\d]/g, "");

        return (
          record.name.toLowerCase().includes(needle) ||
          record.batch.toLowerCase().includes(needle) ||
          record.phone.toLowerCase().includes(needle) ||
          Boolean(needleDigits && phoneDigits.includes(needleDigits))
        );
      })
      .slice(0, 6);
  }, [records, query]);

  const dateFilterOptions = useMemo(() => {
    return Array.from(
      new Set(
        records
          .filter((record) => !filterMonth || record.date.startsWith(filterMonth))
          .map((record) => record.date),
      ),
    ).sort((first, second) => first.localeCompare(second));
  }, [records, filterMonth]);

  const upcomingDays = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index);
      const dateKey = format(date, "yyyy-MM-dd");
      const reservationsByEvent = new Map(
        records
          .filter((record) => record.date === dateKey)
          .map((record) => [record.eventNumber, record]),
      );

      return {
        date,
        dateKey,
        reservationsByEvent,
      };
    });
  }, [records]);

  const editingRecord = useMemo(
    () => records.find((record) => record.id === editingId) ?? null,
    [records, editingId],
  );

  function beginEdit(record: ReservationRecord) {
    setEditingId(record.id);
    setEditError(null);
    setDraft({
      date: record.date,
      eventNumber: record.eventNumber,
      name: record.name,
      phone: record.phone,
      batch: record.batch,
      accommodationType: record.accommodationType,
      boardingDetails: record.boardingDetails ?? "",
    });
  }

  async function saveEdit(id: string) {
    const original = records.find((record) => record.id === id);

    if (!original) {
      setEditError("Reservation could not be found.");
      return;
    }

    const nextDate = draft.date.trim();
    const nextEventNumber = Number(draft.eventNumber);
    const nextName = draft.name.trim();
    const nextPhone = draft.phone.replace(/[^\d]/g, "");
    const nextBatch = draft.batch.trim();
    const nextBoardingDetails = draft.boardingDetails.trim();
    const originalPhone = original.phone.replace(/[^\d]/g, "");
    const payload: Partial<typeof draft> = {};

    if (nextDate !== original.date) {
      payload.date = nextDate;
    }

    if (nextEventNumber !== original.eventNumber) {
      payload.eventNumber = nextEventNumber;
    }

    if (nextName !== original.name) {
      payload.name = nextName;
    }

    if (nextPhone !== originalPhone) {
      payload.phone = nextPhone;
    }

    if (nextBatch !== original.batch) {
      payload.batch = nextBatch;
    }

    if (draft.accommodationType !== original.accommodationType) {
      payload.accommodationType = draft.accommodationType;
    }

    if (nextBoardingDetails !== (original.boardingDetails ?? "")) {
      payload.boardingDetails = nextBoardingDetails;
    }

    if (Object.keys(payload).length === 0) {
      setEditingId(null);
      setEditError(null);
      return;
    }

    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (result.success) {
      setRecords((current) =>
        current.map((record) => (record.id === id ? result.data : record)),
      );
      setEditingId(null);
      setEditError(null);
      return;
    }

    setEditError(result.message || "Reservation could not be updated.");
  }

  async function deleteRecord(id: string) {
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.success) {
      setRecords((current) => current.filter((record) => record.id !== id));
      setDeleteTarget(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function downloadBackup() {
    setBackupStatus(null);
    const response = await fetch("/api/admin/backup");

    if (!response.ok) {
      setBackupStatus("Backup could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `katina-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBackupStatus("Backup downloaded.");
  }

  async function restoreBackup(file: File) {
    setBackupStatus(null);

    const confirmed = window.confirm(
      "Restore this backup? Current reservations will be kept, and only missing backup reservations will be added.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const backup = JSON.parse(await file.text());
      const response = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });
      const result = await response.json();

      if (!result.success) {
        setBackupStatus(result.message || "Backup could not be restored.");
        return;
      }

      setRecords(result.data.reservations);
      setBackupStatus(
        `Backup restored. ${result.data.importedCount} added, ${result.data.skippedCount} kept from current data.`,
      );
    } catch {
      setBackupStatus("Backup file could not be read.");
    } finally {
      if (restoreInputRef.current) {
        restoreInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex flex-col gap-4 py-3 sm:py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-[#2e1b10] sm:text-4xl dark:text-[#fff2da]">
            Admin dashboard
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <GlassButton onClick={() => router.push("/")} className="w-full sm:w-auto">
            <Home className="size-4" />
            Home
          </GlassButton>
          <GlassButton onClick={logout} className="w-full sm:w-auto">
            <LogOut className="size-4" />
            Logout
          </GlassButton>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total reservations"
          value={stats.totalReservations}
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="This month"
          value={stats.reservationsThisMonth}
          icon={<CalendarDays className="size-5" />}
        />
        <StatCard
          label="Open slots until Oct 25"
          value={stats.availableResponsibilities}
          icon={<Clock3 className="size-5" />}
        />
        <StatCard
          label="Occupancy"
          value={`${stats.occupancyPercentage}%`}
          icon={<CalendarDays className="size-5" />}
        />
      </div>

      <div className="grid gap-6">
        <GlassCard className="p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2e1b10] dark:text-[#fff2da]">
                Upcoming 7 days
              </h2>
              <p className="text-sm text-[#7b5a3b] dark:text-[#cdb390]">
                Reservations that may need contact soon.
              </p>
            </div>
            <span className="rounded-full border border-white/24 bg-white/7 px-3 py-1 text-xs font-semibold text-[#fff2da] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[16px]">
              Next 7 days
            </span>
          </div>

          <div className="reservation-scroll mt-4 grid auto-cols-[82%] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">
            {upcomingDays.map((day) => (
              <div
                key={day.dateKey}
                className="min-w-0 overflow-hidden rounded-2xl border border-white/22 bg-white/7 p-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_26px_rgba(0,0,0,0.20)] backdrop-blur-[18px]"
              >
                <div className="mb-3">
                  <p className="font-semibold text-[#fff2da]">
                    {format(day.date, "EEE")}
                  </p>
                  <p className="text-xs text-[#cdb390]">
                    {format(day.date, "MMM d")}
                  </p>
                </div>
                <div className="grid gap-2">
                  {EVENT_NUMBERS.map((eventNumber) => {
                    const record = day.reservationsByEvent.get(eventNumber);
                    const event = RESPONSIBILITY_EVENTS[eventNumber - 1];

                    return (
                      <button
                        key={eventNumber}
                        type="button"
                        disabled={!record}
                        onClick={() => record && setDetailRecord(record)}
                        className={cn(
                          "min-w-0 overflow-hidden rounded-xl border p-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30",
                          record
                            ? "border-[#8dc5df]/42 bg-white/6 hover:bg-white/10"
                            : "border-[#b6e56f]/70 bg-[#b6e56f]/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_18px_rgba(182,229,111,0.16)]",
                        )}
                      >
                        <p className="min-w-0 truncate text-[11px] font-semibold text-[#dbc6aa]">
                          {eventNumber}. {event.name}
                        </p>
                        {record ? (
                          <div className="mt-1 grid min-w-0 gap-0.5 text-xs">
                            <span className="min-w-0 truncate font-semibold text-white">
                              {record.name}
                            </span>
                            <span className="min-w-0 truncate text-slate-300">
                              {record.phone}
                            </span>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-[#dff7b8]">
                            Open
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {upcomingDays.every((day) => day.reservationsByEvent.size === 0) && (
            <div className="mt-3 rounded-2xl border border-white/16 bg-white/5 px-4 py-4 text-center text-sm text-[#cdb390]">
              No reservations in the next 7 days.
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#2e1b10] dark:text-[#fff2da]">
                  Reservation management
                </h2>
                <p className="text-sm text-[#7b5a3b] dark:text-[#cdb390]">
                  Search by name, batch, or phone. Filters combine with search.
                </p>
                <div className="mt-4 flex min-h-24 w-full max-w-sm flex-col justify-center rounded-[24px] border border-white/24 bg-white/7 px-5 py-4 text-[#fff2da] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_30px_rgba(0,0,0,0.16)] backdrop-blur-[14px]">
                  <p className="text-sm font-medium text-[#dbc6aa]">
                    Reservations shown
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {filteredRecords.length}
                    <span className="ml-2 text-base font-medium text-[#cdb390]">
                      of {records.length}
                    </span>
                  </p>
                </div>
              </div>
              <div className="grid gap-3 xl:min-w-[780px]">
                <div className="grid gap-1.5">
                  <p className="px-1 text-xs font-semibold uppercase tracking-normal text-[#7b5a3b] dark:text-[#cdb390]">
                    Search
                  </p>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <GlassInput
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        window.setTimeout(() => setShowSuggestions(false), 120);
                      }}
                      placeholder="Search name, batch, phone"
                      className="pl-9"
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-[18px] border border-white/90 bg-white/34 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),inset_1px_0_0_rgba(255,255,255,0.42),0_18px_44px_rgba(8,20,40,0.12)] backdrop-blur-[42px] dark:border-white/24 dark:bg-black/28">
                        {searchSuggestions.map((record) => (
                          <button
                            key={record.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setQuery(record.name);
                              setShowSuggestions(false);
                            }}
                            className="grid w-full gap-0.5 rounded-2xl px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
                          >
                            <span className="font-medium">{record.name}</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {record.batch} · {record.phone}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <p className="px-1 text-xs font-semibold uppercase tracking-normal text-[#7b5a3b] dark:text-[#cdb390]">
                    Filters
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="relative">
                      {!filterMonth && (
                        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400">
                          Select month
                        </span>
                      )}
                      <GlassInput
                        type="month"
                        value={filterMonth}
                        onChange={(event) => {
                          const nextMonth = event.target.value;

                          setFilterMonth(nextMonth);
                          setFilterDate((currentDate) =>
                            currentDate && !currentDate.startsWith(nextMonth)
                              ? ""
                              : currentDate,
                          );
                        }}
                        aria-label="Filter by month"
                        className={cn(!filterMonth && "text-transparent")}
                      />
                    </div>
                    <select
                      value={filterDate}
                      onChange={(event) => setFilterDate(event.target.value)}
                      aria-label="Filter by date"
                      className={cn(
                        "h-11 rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
                        !filterDate && "text-slate-400 dark:text-slate-400",
                      )}
                    >
                      <option value="" className="bg-[#21150f] text-[#fff2da]">
                        Select date
                      </option>
                      {dateFilterOptions.map((date) => (
                        <option
                          key={date}
                          value={date}
                          className="bg-[#21150f] text-[#fff2da]"
                        >
                          {format(parseISO(date), "MMM d, yyyy")}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterEvent}
                      onChange={(event) => setFilterEvent(event.target.value)}
                      aria-label="Filter by event"
                      className="h-11 rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                    >
                      <option value="" className="bg-[#21150f] text-[#fff2da]">
                        Select event
                      </option>
                      {RESPONSIBILITY_EVENTS.map((event) => (
                        <option
                          key={event.number}
                          value={event.number}
                          className="bg-[#21150f] text-[#fff2da]"
                        >
                          {event.number}. {event.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 text-xs text-[#7b5a3b] dark:text-[#cdb390]">
              {(query || filterDate || filterMonth || filterEvent) && (
                <GlassButton
                  onClick={() => {
                    setQuery("");
                    setFilterDate("");
                    setFilterMonth("");
                    setFilterEvent("");
                  }}
                  className="h-8 px-3 text-xs"
                >
                  Clear filters
                </GlassButton>
              )}
            </div>
          </div>

          <div className="reservation-scroll mt-5 max-h-[72vh] overflow-y-auto overflow-x-hidden pr-2 md:hidden">
            <div className="grid gap-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-[24px] border border-white/22 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.07))] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-[14px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#fff2da]">
                        {format(parseISO(record.date), "MMM d, yyyy")}
                      </p>
                      <p className="mt-1 text-xs text-[#cdb390]">
                        {record.eventNumber}.{" "}
                        {RESPONSIBILITY_EVENTS[record.eventNumber - 1].name}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <GlassButton
                        aria-label="Edit reservation"
                        onClick={() => beginEdit(record)}
                        className="size-9 px-0"
                      >
                        <Pencil className="size-4" />
                      </GlassButton>
                      <GlassButton
                        aria-label="Delete reservation"
                        tone="danger"
                        onClick={() => setDeleteTarget(record)}
                        className="size-9 px-0"
                      >
                        <Trash2 className="size-4" />
                      </GlassButton>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["Name", record.name],
                      ["Phone", record.phone],
                      ["Batch", record.batch],
                      [
                        "Stay",
                        record.accommodationType === "HOSTEL"
                          ? "Hostel"
                          : "Boarding",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/12 bg-white/5 px-3 py-2"
                      >
                        <p className="text-[11px] text-[#cdb390]">{label}</p>
                        <p className="mt-0.5 break-words font-medium text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                    <div className="col-span-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2">
                      <p className="text-[11px] text-[#cdb390]">Boarding</p>
                      <p className="mt-0.5 break-words font-medium text-white">
                        {record.boardingDetails ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
                  No reservations match the current search and filters.
                </div>
              )}
            </div>
          </div>

          <div className="reservation-scroll mt-5 hidden max-h-[68vh] overflow-y-auto overflow-x-hidden pr-2 md:block">
            <table className="w-full table-fixed border-separate border-spacing-y-2 text-center text-xs lg:text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[21%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="sticky top-0 z-20 bg-white/36 text-xs uppercase text-slate-600 backdrop-blur-[38px] dark:bg-black/28 dark:text-slate-300">
                <tr>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Event</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Batch</th>
                  <th className="px-2 py-2">Stay</th>
                  <th className="px-2 py-2">Boarding</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="rounded-2xl border border-white/86 bg-[linear-gradient(145deg,rgba(255,255,255,0.38),rgba(255,255,255,0.09)_44%,rgba(255,255,255,0.24))] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_1px_0_0_rgba(255,255,255,0.42),0_10px_26px_rgba(8,20,40,0.06)] backdrop-blur-[32px] dark:border-white/20 dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_44%,rgba(255,255,255,0.055))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_30px_rgba(0,0,0,0.24)]"
                    >
                      <td className="rounded-l-2xl px-2 py-3 align-middle break-words">
                        {format(parseISO(record.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {RESPONSIBILITY_EVENTS[record.eventNumber - 1].name}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {record.name}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {record.phone}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {record.batch}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {record.accommodationType === "HOSTEL"
                          ? "Hostel"
                          : "Boarding"}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        <span className="line-clamp-2">
                          {record.boardingDetails ?? "-"}
                        </span>
                      </td>
                      <td className="rounded-r-2xl px-2 py-3 align-middle">
                        <div className="flex flex-wrap justify-center gap-2">
                          <GlassButton
                            aria-label="Edit reservation"
                            onClick={() => beginEdit(record)}
                          >
                            <Pencil className="size-4" />
                          </GlassButton>
                          <GlassButton
                            aria-label="Delete reservation"
                            tone="danger"
                            onClick={() => setDeleteTarget(record)}
                          >
                            <Trash2 className="size-4" />
                          </GlassButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="rounded-2xl border border-white/86 bg-white/18 px-3 py-8 text-center text-sm text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-[32px] dark:border-white/20 dark:bg-white/5 dark:text-slate-400"
                    >
                      No reservations match the current search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2e1b10] dark:text-[#fff2da]">
              Data safety
            </h2>
            <p className="text-sm text-[#7b5a3b] dark:text-[#cdb390]">
              Download a backup or restore missing reservations from a backup file.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <GlassButton onClick={downloadBackup} className="w-full sm:w-auto">
              <Download className="size-4" />
              Backup
            </GlassButton>
            <GlassButton
              onClick={() => restoreInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="size-4" />
              Restore
            </GlassButton>
            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void restoreBackup(file);
                }
              }}
            />
          </div>
        </div>
        {backupStatus && (
          <div className="mt-3 rounded-2xl border border-white/20 bg-white/7 px-4 py-3 text-sm font-medium text-[#fff2da] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[18px]">
            {backupStatus}
          </div>
        )}
      </GlassCard>
      {editingRecord && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/18 p-4 backdrop-blur-[18px]"
          onMouseDown={() => {
            setEditingId(null);
            setEditError(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit reservation"
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/34 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),rgba(255,255,255,0.060)_48%,rgba(255,255,255,0.13))] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_0_0_1px_rgba(255,255,255,0.10),0_34px_100px_rgba(0,0,0,0.30)] backdrop-blur-[18px] sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <GlassButton
              aria-label="Close edit"
              onClick={() => {
                setEditingId(null);
                setEditError(null);
              }}
              className="absolute right-3 top-3 size-8 px-0"
            >
              ×
            </GlassButton>
            <div className="pr-9">
              <p className="text-sm text-[#cdb390]">
                {format(parseISO(editingRecord.date), "EEEE, MMMM d, yyyy")}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#fff2da]">
                Edit reservation
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Date
                <GlassInput
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Event
                <select
                  value={draft.eventNumber}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      eventNumber: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))]"
                >
                  {RESPONSIBILITY_EVENTS.map((event) => (
                    <option
                      key={event.number}
                      value={event.number}
                      className="bg-[#21150f] text-[#fff2da]"
                    >
                      {event.number}. {event.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Name
                <GlassInput
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Phone
                <GlassInput
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Batch
                <GlassInput
                  value={draft.batch}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      batch: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa]">
                Stay
                <select
                  value={draft.accommodationType}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      accommodationType: event.target.value as
                        | "HOSTEL"
                        | "BOARDING",
                    }))
                  }
                  className="h-11 w-full rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))]"
                >
                  <option value="HOSTEL" className="bg-[#21150f] text-[#fff2da]">
                    Hostel
                  </option>
                  <option
                    value="BOARDING"
                    className="bg-[#21150f] text-[#fff2da]"
                  >
                    Boarding
                  </option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#dbc6aa] sm:col-span-2">
                Boarding name or address
                <GlassTextarea
                  value={draft.boardingDetails}
                  disabled={draft.accommodationType === "HOSTEL"}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      boardingDetails: event.target.value,
                    }))
                  }
                  className="min-h-24"
                />
              </label>
            </div>

            {editError && (
              <div className="mt-4 rounded-2xl border border-[#ff6b4a]/30 bg-[#ff6b4a]/10 px-3 py-2 text-center text-sm text-[#ffb1a0]">
                {editError}
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <GlassButton
                onClick={() => {
                  setEditingId(null);
                  setEditError(null);
                }}
              >
                Cancel
              </GlassButton>
              <GlassButton
                tone="primary"
                onClick={() => saveEdit(editingRecord.id)}
              >
                Save changes
              </GlassButton>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/18 p-4 backdrop-blur-[18px]"
          onMouseDown={() => setDeleteTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete reservation"
            className="relative w-full max-w-md rounded-[30px] border border-white/34 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),rgba(255,255,255,0.060)_48%,rgba(255,255,255,0.13))] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_0_0_1px_rgba(255,255,255,0.10),0_34px_100px_rgba(0,0,0,0.30)] backdrop-blur-[18px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-[#fff2da]">
              Delete reservation?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#dbc6aa]">
              This will remove the reservation from {deleteTarget.name} for{" "}
              {RESPONSIBILITY_EVENTS[deleteTarget.eventNumber - 1].name} on{" "}
              {format(parseISO(deleteTarget.date), "MMMM d, yyyy")}.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <GlassButton onClick={() => setDeleteTarget(null)}>
                Cancel
              </GlassButton>
              <GlassButton
                tone="danger"
                onClick={() => deleteRecord(deleteTarget.id)}
              >
                Delete
              </GlassButton>
            </div>
          </div>
        </div>
      )}
      {detailRecord && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/12 p-4 backdrop-blur-[12px]"
          onMouseDown={() => setDetailRecord(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Reservation detail"
            className="relative w-full max-w-md rounded-[30px] border border-white/34 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.055)_48%,rgba(255,255,255,0.12))] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_0_0_1px_rgba(255,255,255,0.10),0_34px_100px_rgba(0,0,0,0.26)] backdrop-blur-[14px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <GlassButton
              aria-label="Close details"
              onClick={() => setDetailRecord(null)}
              className="absolute right-3 top-3 size-8 px-0"
            >
              ×
            </GlassButton>
            <div className="pr-8">
              <p className="text-sm text-[#cdb390]">
                {format(parseISO(detailRecord.date), "EEEE, MMMM d, yyyy")}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#fff2da]">
                {RESPONSIBILITY_EVENTS[detailRecord.eventNumber - 1].name}
              </h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ["Name", detailRecord.name],
                ["Phone", detailRecord.phone],
                ["Batch", detailRecord.batch],
                [
                  "Stay",
                  detailRecord.accommodationType === "HOSTEL"
                    ? "Hostel"
                    : "Boarding",
                ],
                ["Boarding", detailRecord.boardingDetails ?? "-"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/16 bg-white/6 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                >
                  <p className="text-xs text-[#cdb390]">{label}</p>
                  <p className="mt-1 font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
