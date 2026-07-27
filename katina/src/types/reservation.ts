import type { EventNumber } from "@/constants/events";

export type ReservationSummary = {
  id: string;
  date: string;
  eventNumber: EventNumber;
  createdAt: string;
};

export type ReservationRecord = ReservationSummary & {
  name: string;
  phone: string;
  batch: string;
  accommodationType: "HOSTEL" | "BOARDING";
  boardingDetails: string | null;
  updatedAt: string;
};

export type CalendarDay = {
  date: string;
  reservations: ReservationSummary[];
};

export type DashboardStats = {
  totalReservations: number;
  reservationsToday: number;
  reservationsThisMonth: number;
  availableResponsibilities: number;
  occupancyPercentage: number;
};
