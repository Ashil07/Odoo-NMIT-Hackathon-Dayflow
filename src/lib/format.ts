// date + duration shaping shared by api routes.
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function hhmm(d: Date): string {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

// "Fri 21 Aug"
export function fmtDay(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// "21 Aug 2026"
export function fmtLongDay(d: Date): string {
  return `${DAYS[d.getDay()]}day ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// one decimal hours between two times
export function hrsBetween(a: Date, b: Date): string {
  const h = (b.getTime() - a.getTime()) / 3_600_000;
  return Number.isFinite(h) && h >= 0 ? h.toFixed(1) : "—";
}

// local midnight of the given date
export function dayStart(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// "28 Aug – 01 Sep" style range
export function fmtRange(from: Date, to: Date): string {
  const one = `${from.getDate()} ${MONTHS[from.getMonth()]}`;
  if (from.toDateString() === to.toDateString()) return one;
  return `${one} – ${to.getDate()} ${MONTHS[to.getMonth()]}`;
}
