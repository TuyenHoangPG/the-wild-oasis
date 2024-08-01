import { auth } from "@/app/_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "@/app/_lib/data-service";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import LoginMessage from "./LoginMessage";

export default async function Reservation({ cabin }) {
  const [settings, bookDates, session] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
    auth(),
  ]);

  return (
    <div className="grid grid-cols-2 border border-primary-800 min-h-[400px]">
      <DateSelector settings={settings} bookDates={bookDates} cabin={cabin} />
      {session?.user ? (
        <ReservationForm cabin={cabin} user={session.user} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
