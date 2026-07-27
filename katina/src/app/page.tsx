import { GlassShell } from "@/components/layout/GlassShell";
import { PublicCalendar } from "@/features/calendar/components/PublicCalendar";
import { getCalendarReservations } from "@/services/reservation-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const reservations = await getCalendarReservations(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  return (
    <GlassShell>
      <PublicCalendar initialReservations={reservations} />
    </GlassShell>
  );
}
