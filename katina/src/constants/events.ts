export const RESPONSIBILITY_EVENTS = [
  { number: 1, name: "උදේ දානය" },
  { number: 2, name: "දහවල් දානය" },
  { number: 3, name: "සවස ගිලන්පස" },
  { number: 4, name: "සවස බෝධි වන්දනාව" },
] as const;

export const EVENT_NUMBERS = [1, 2, 3, 4] as const;

export type EventNumber = (typeof EVENT_NUMBERS)[number];

export const MAX_EVENTS_PER_DAY = EVENT_NUMBERS.length;
