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
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-[#dbc6aa]">සම්බන්ධ වීමට</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#fff2da]">
          සාලිය සර්
        </h2>
        <a
          href="tel:0776993908"
          className="mt-2 inline-flex text-lg font-semibold text-white transition hover:text-[#fff2da] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30"
        >
          077699 3908
        </a>
        <p className="mt-5 text-sm font-medium leading-6 text-[#dbc6aa]">
          බෞද්ධ සහෝදර සංගමය, යාපනය විශ්වවිද්‍යාලය
        </p>
      </section>
    </GlassShell>
  );
}
