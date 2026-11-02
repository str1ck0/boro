import { differenceInCalendarDays, format, formatDistanceToNowStrict, isSameMonth, parseISO } from "date-fns";

/**
 * Cents → "R1,250" (or "R99.50" when there are cents). Formatted by hand so the
 * output is identical on server and client regardless of ICU locale data.
 */
export function money(cents: number) {
  const rand = cents / 100;
  const digits = cents % 100 === 0 ? 0 : 2;
  return `R${rand.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
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
