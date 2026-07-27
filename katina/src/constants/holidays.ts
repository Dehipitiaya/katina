export const HOLIDAYS_BY_DATE: Record<string, string> = {
  "2026-01-03": "Duruthu Full Moon Poya Day",
  "2026-01-15": "Tamil Thai Pongal Day",
  "2026-02-01": "Navam Full Moon Poya Day",
  "2026-02-04": "Independence Day",
  "2026-02-15": "Mahasivarathri Day",
  "2026-03-02": "Medin Full Moon Poya Day",
  "2026-03-21": "Id-Ul-Fitre",
  "2026-04-01": "Bak Full Moon Poya Day",
  "2026-04-03": "Good Friday",
  "2026-04-13": "Day prior to Sinhala and Tamil New Year",
  "2026-04-14": "Sinhala and Tamil New Year Day",
  "2026-05-01": "Vesak Full Moon Poya Day / May Day",
  "2026-05-02": "Day following Vesak Full Moon Poya Day",
  "2026-05-28": "Id-Ul-Allah",
  "2026-05-30": "Adhi Poson Full Moon Poya Day",
  "2026-06-29": "Poson Full Moon Poya Day",
  "2026-07-29": "Esala Full Moon Poya Day",
  "2026-08-26": "Milad-Un-Nabi",
  "2026-08-27": "Nikini Full Moon Poya Day",
  "2026-09-26": "Binara Full Moon Poya Day",
  "2026-10-25": "Vap Full Moon Poya Day",
  "2026-11-08": "Deepawali Festival Day",
  "2026-11-24": "Ill Full Moon Poya Day",
  "2026-12-23": "Unduwap Full Moon Poya Day",
  "2026-12-25": "Christmas Day",
};

export function getHolidayName(dateKey: string) {
  return HOLIDAYS_BY_DATE[dateKey] ?? null;
}
