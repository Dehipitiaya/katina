"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { RESPONSIBILITY_EVENTS } from "@/constants/events";
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
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    batch: "",
    accommodationType: "HOSTEL" as "HOSTEL" | "BOARDING",
    boardingDetails: "",
  });

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const needleDigits = query.replace(/[^\d]/g, "");

    return records.filter((record) => {
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

  function beginEdit(record: ReservationRecord) {
    setEditingId(record.id);
    setDraft({
      name: record.name,
      phone: record.phone,
      batch: record.batch,
      accommodationType: record.accommodationType,
      boardingDetails: record.boardingDetails ?? "",
    });
  }

  async function saveEdit(id: string) {
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json();

    if (result.success) {
      setRecords((current) =>
        current.map((record) => (record.id === id ? result.data : record)),
      );
      setEditingId(null);
    }
  }

  async function deleteRecord(id: string) {
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.success) {
      setRecords((current) => current.filter((record) => record.id !== id));
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-white/90 bg-white/28 px-3 py-1 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),inset_1px_0_0_rgba(255,255,255,0.48)] backdrop-blur-[34px] dark:border-white/24 dark:bg-white/7 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            Admin
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-[#2e1b10] dark:text-[#fff2da]">
            Responsibility dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5036] dark:text-[#dbc6aa]">
            Review private reservation details, correct records, and release
            responsibilities when needed.
          </p>
        </div>
        <GlassButton onClick={logout}>
          <LogOut className="size-4" />
          Logout
        </GlassButton>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total reservations"
          value={stats.totalReservations}
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Today"
          value={stats.reservationsToday}
          icon={<Clock3 className="size-5" />}
        />
        <StatCard
          label="This month"
          value={stats.reservationsThisMonth}
          icon={<CalendarDays className="size-5" />}
        />
        <StatCard
          label="Available this month"
          value={stats.availableResponsibilities}
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Occupancy"
          value={`${stats.occupancyPercentage}%`}
          icon={<CalendarDays className="size-5" />}
        />
      </div>

      <div className="grid gap-6">
        <GlassCard className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#2e1b10] dark:text-[#fff2da]">
                  Reservation management
                </h2>
                <p className="text-sm text-[#7b5a3b] dark:text-[#cdb390]">
                  Search by name, batch, or phone. Filters combine with search.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[760px]">
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
                    placeholder="Name, batch, phone"
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
                <GlassInput
                  type="date"
                  value={filterDate}
                  onChange={(event) => setFilterDate(event.target.value)}
                  aria-label="Filter by date"
                />
                <GlassInput
                  type="month"
                  value={filterMonth}
                  onChange={(event) => setFilterMonth(event.target.value)}
                  aria-label="Filter by month"
                />
                <select
                  value={filterEvent}
                  onChange={(event) => setFilterEvent(event.target.value)}
                  aria-label="Filter by event"
                  className="h-11 rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                >
                  <option value="">All events</option>
                  {RESPONSIBILITY_EVENTS.map((event) => (
                    <option key={event.number} value={event.number}>
                      {event.number}. {event.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7b5a3b] dark:text-[#cdb390]">
              <span>
                Showing {filteredRecords.length} of {records.length} reservations
              </span>
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

          <div className="mt-5 max-h-[68vh] overflow-y-auto overflow-x-hidden pr-1">
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
                {filteredRecords.map((record) => {
                  const editing = editingId === record.id;

                  return (
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
                        {editing ? (
                          <GlassInput
                            value={draft.name}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          record.name
                        )}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {editing ? (
                          <GlassInput
                            value={draft.phone}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                phone: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          record.phone
                        )}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {editing ? (
                          <GlassInput
                            value={draft.batch}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                batch: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          record.batch
                        )}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {editing ? (
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
                            className="h-11 w-full rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.32))] px-2 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.56)] outline-none backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))] dark:text-white"
                          >
                            <option value="HOSTEL">Hostel</option>
                            <option value="BOARDING">Boarding</option>
                          </select>
                        ) : record.accommodationType === "HOSTEL" ? (
                          "Hostel"
                        ) : (
                          "Boarding"
                        )}
                      </td>
                      <td className="px-2 py-3 align-middle break-words">
                        {editing ? (
                          <GlassTextarea
                            value={draft.boardingDetails}
                            disabled={draft.accommodationType === "HOSTEL"}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                boardingDetails: event.target.value,
                              }))
                            }
                            className="min-h-16"
                          />
                        ) : (
                          <span className="line-clamp-2">
                            {record.boardingDetails ?? "-"}
                          </span>
                        )}
                      </td>
                      <td className="rounded-r-2xl px-2 py-3 align-middle">
                        <div className="flex flex-wrap justify-center gap-2">
                          {editing ? (
                            <>
                              <GlassButton
                                tone="primary"
                                onClick={() => saveEdit(record.id)}
                              >
                                Save
                              </GlassButton>
                              <GlassButton onClick={() => setEditingId(null)}>
                                Cancel
                              </GlassButton>
                            </>
                          ) : (
                            <>
                              <GlassButton
                                aria-label="Edit reservation"
                                onClick={() => beginEdit(record)}
                              >
                                <Pencil className="size-4" />
                              </GlassButton>
                              <GlassButton
                                aria-label="Delete reservation"
                                tone="danger"
                                onClick={() => deleteRecord(record.id)}
                              >
                                <Trash2 className="size-4" />
                              </GlassButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    </section>
  );
}
