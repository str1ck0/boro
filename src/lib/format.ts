import { differenceInCalendarDays, format, formatDistanceToNowStrict, isSameMonth, parseISO } from "date-fns";

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
const audCents = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** Cents → "$12" (or "$12.50" when there are cents). */
export function money(cents: number) {
  return cents % 100 === 0 ? aud.format(cents / 100) : audCents.format(cents / 100);
}

/** Inclusive number of days between two ISO dates. */
export function daysBetween(start: string, end: string) {
  return differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;
}

export function dateRange(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  if (start === end) return format(s, "EEE d MMM");
  if (isSameMonth(s, e)) return `${format(s, "d")}–${format(e, "d MMM")}`;
  return `${format(s, "d MMM")} – ${format(e, "d MMM")}`;
}

export function ago(date: Date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function shortDate(date: Date) {
  const days = differenceInCalendarDays(new Date(), date);
  if (days === 0) return format(date, "h:mmaaa");
  if (days < 7) return format(date, "EEE");
  return format(date, "d MMM");
}

export function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function memberSince(date: Date) {
  return format(date, "MMMM yyyy");
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}
