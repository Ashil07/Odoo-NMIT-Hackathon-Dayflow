// mock world for the dayflow UI. no backend, no fetch. numbers stay put.

export type Tone = "green" | "amber" | "red" | "grey" | "ink";

export type ToneSet = { bg: string; bd: string; fg: string; dot: string };

export const TONES: Record<Tone, ToneSet> = {
  green: { bg: "rgba(15,138,95,.1)", bd: "rgba(15,138,95,.2)", fg: "#0B6B49", dot: "#0F8A5F" },
  amber: { bg: "rgba(180,114,10,.1)", bd: "rgba(180,114,10,.22)", fg: "#8E5A07", dot: "#B4720A" },
  red: { bg: "rgba(198,66,60,.1)", bd: "rgba(198,66,60,.2)", fg: "#A83A34", dot: "#C6423C" },
  grey: { bg: "rgba(16,19,23,.045)", bd: "rgba(16,19,23,.08)", fg: "#767C87", dot: "#A6ACB6" },
  ink: { bg: "#101317", bd: "#101317", fg: "#ffffff", dot: "#101317" },
};

// map a human status word onto a colour family. leave/today stay monochrome —
// the plane icon already carries "leave", so no hue is needed there.
export function tone(status: string): ToneSet {
  if (status === "Present" || status === "Approved") return TONES.green;
  if (status === "Half-day" || status === "Pending") return TONES.amber;
  if (status === "Absent" || status === "Rejected") return TONES.red;
  if (status === "Leave" || status === "On leave") return TONES.grey;
  if (status === "Today") return TONES.ink;
  return TONES.grey;
}

export type Avatar = { init: string; tint: string; ink: string };

// four neutral greys, picked deterministically per name — no hue
const AVATAR_TINTS: Avatar[] = [
  { init: "", tint: "#E4E7EA", ink: "#3A3F47" },
  { init: "", tint: "#DDE0E4", ink: "#282C31" },
  { init: "", tint: "#EBEDEF", ink: "#5C626C" },
  { init: "", tint: "#D6D9DD", ink: "#101317" },
];

function tintFor(name: string): Omit<Avatar, "init"> {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const t = AVATAR_TINTS[h % AVATAR_TINTS.length];
  return { tint: t.tint, ink: t.ink };
}

export const AVATARS: Record<string, Avatar> = {
  "Aarav Rao": { init: "AR", ...tintFor("Aarav Rao") },
  "Meera Kulkarni": { init: "MK", ...tintFor("Meera Kulkarni") },
  "Sahil Verma": { init: "SV", ...tintFor("Sahil Verma") },
  "Tanvi Nair": { init: "TN", ...tintFor("Tanvi Nair") },
  "Rohan Iyer": { init: "RI", ...tintFor("Rohan Iyer") },
  "Diya Menon": { init: "DM", ...tintFor("Diya Menon") },
  "Kabir Shah": { init: "KS", ...tintFor("Kabir Shah") },
  "Ishita Bose": { init: "IB", ...tintFor("Ishita Bose") },
};

export const FALLBACK_AVATAR: Avatar = { init: "??", tint: "#E4E7EA", ink: "#5C626C" };

export function avatarOf(name: string): Avatar {
  return AVATARS[name] ?? FALLBACK_AVATAR;
}

export type Person = {
  id: string;
  name: string;
  role: string;
  dept: string;
  st: string;
  in: string;
  out: string;
  hrs: string;
  extra: string;
  login: string;
  mgr: string;
  joined: string;
  loc: string;
};

export const PEOPLE: Person[] = [
  { id: "EMP-1042", name: "Aarav Rao", role: "Product Designer", dept: "Design", st: "Present", in: "09:04", out: "—", hrs: "8.6", extra: "0.6", login: "OIAARA20230012", mgr: "Priya Nair", joined: "12 Mar 2023", loc: "Bengaluru" },
  { id: "EMP-1017", name: "Meera Kulkarni", role: "Engineering Manager", dept: "Engineering", st: "Present", in: "08:58", out: "—", hrs: "8.9", extra: "0.9", login: "OIMEKU20210004", mgr: "Rahul Desai", joined: "04 Jan 2021", loc: "Pune" },
  { id: "EMP-1063", name: "Sahil Verma", role: "Backend Engineer", dept: "Engineering", st: "Leave", in: "—", out: "—", hrs: "—", extra: "—", login: "OISAVE20230063", mgr: "Meera Kulkarni", joined: "19 Jun 2023", loc: "Bengaluru" },
  { id: "EMP-1008", name: "Tanvi Nair", role: "HR Officer", dept: "People", st: "Present", in: "08:52", out: "—", hrs: "9.1", extra: "1.1", login: "OITANA20200008", mgr: "Rahul Desai", joined: "02 Feb 2020", loc: "Bengaluru" },
  { id: "EMP-1091", name: "Rohan Iyer", role: "QA Engineer", dept: "Engineering", st: "Half-day", in: "09:48", out: "13:30", hrs: "3.7", extra: "—", login: "OIROIY20240091", mgr: "Meera Kulkarni", joined: "08 Apr 2024", loc: "Chennai" },
  { id: "EMP-1075", name: "Diya Menon", role: "Accountant", dept: "Finance", st: "Present", in: "09:20", out: "—", hrs: "8.2", extra: "0.2", login: "OIDIME20230075", mgr: "Rahul Desai", joined: "27 Nov 2023", loc: "Kochi" },
  { id: "EMP-1029", name: "Kabir Shah", role: "Sales Lead", dept: "Revenue", st: "Absent", in: "—", out: "—", hrs: "—", extra: "—", login: "OIKASH20220029", mgr: "Rahul Desai", joined: "16 May 2022", loc: "Mumbai" },
  { id: "EMP-1084", name: "Ishita Bose", role: "Frontend Engineer", dept: "Engineering", st: "Present", in: "09:31", out: "—", hrs: "8.0", extra: "—", login: "OIISBO20240084", mgr: "Meera Kulkarni", joined: "22 Jul 2024", loc: "Kolkata" },
];

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type LeaveRequest = {
  id: string;
  who: string;
  type: string;
  range: string;
  days: number;
  status: LeaveStatus;
  note: string;
  attach?: string;
};

export const SEED_REQUESTS: LeaveRequest[] = [
  { id: "LR-2081", who: "Aarav Rao", type: "Sick leave", range: "20 Aug", days: 1, status: "Approved", note: "Approved by Priya Nair — “Get well soon.”" },
  { id: "LR-2074", who: "Aarav Rao", type: "Paid leave", range: "28 Aug – 01 Sep", days: 5, status: "Pending", note: "Family wedding in Kochi. Handover noted in Linear." },
  { id: "LR-2050", who: "Aarav Rao", type: "Unpaid leave", range: "04 Jul", days: 1, status: "Rejected", note: "Rejected — “Sprint release day, please reschedule.”" },
  { id: "LR-2093", who: "Rohan Iyer", type: "Sick leave", range: "24 Aug – 25 Aug", days: 2, status: "Pending", note: "Dengue test pending, doctor advised two days rest.", attach: "medical-certificate.pdf" },
  { id: "LR-2092", who: "Ishita Bose", type: "Paid time off", range: "01 Sep – 05 Sep", days: 5, status: "Pending", note: "Pre-planned trip. Cover confirmed with Meera." },
  { id: "LR-2089", who: "Kabir Shah", type: "Unpaid leave", range: "26 Aug", days: 1, status: "Pending", note: "Personal errand, no paid balance left." },
  { id: "LR-2085", who: "Diya Menon", type: "Paid time off", range: "18 Sep – 19 Sep", days: 2, status: "Pending", note: "Sister’s convocation in Kochi." },
  { id: "LR-2077", who: "Meera Kulkarni", type: "Paid time off", range: "11 Aug – 12 Aug", days: 2, status: "Approved", note: "Approved by Tanvi Nair." },
];

export const ALERTS = [
  { id: 1, dot: "#0F8A5F", title: "Sick leave approved", meta: "Priya Nair · 2h ago" },
  { id: 2, dot: "#B4720A", title: "Timesheet closes Sunday", meta: "Payroll · yesterday" },
  { id: 3, dot: "#767C87", title: "July payslip is ready", meta: "Finance · 3 days ago" },
];

export const ACTIVITY = [
  { id: 1, dot: "#0F8A5F", title: "Checked in", meta: "21 AUG · 09:04" },
  { id: 2, dot: "#767C87", title: "Sick leave approved by Priya Nair", meta: "20 AUG · 08:12" },
  { id: 3, dot: "#B4720A", title: "Half-day recorded", meta: "19 AUG · 13:30" },
  { id: 4, dot: "#767C87", title: "Phone number updated", meta: "12 AUG · 16:44" },
];

export const SALARY_READONLY = [
  { id: 1, label: "Basic", note: "50% of CTC", amount: "₹48,000", fg: "#101317" },
  { id: 2, label: "House rent allowance", note: "40% of basic", amount: "₹19,200", fg: "#101317" },
  { id: 3, label: "Special allowance", note: "", amount: "₹12,400", fg: "#101317" },
  { id: 4, label: "Provident fund", note: "employee share", amount: "−₹5,760", fg: "#A83A34" },
  { id: 5, label: "Professional tax", note: "Karnataka", amount: "−₹200", fg: "#A83A34" },
  { id: 6, label: "Gross monthly", note: "before deductions", amount: "₹79,600", fg: "#5C626C" },
];

export const PAYSLIPS = [
  { id: 1, month: "July 2026", net: "₹73,640" },
  { id: 2, month: "June 2026", net: "₹73,640" },
  { id: 3, month: "May 2026", net: "₹71,180" },
  { id: 4, month: "April 2026", net: "₹71,180" },
];

export const DOCS = [
  { id: 1, name: "Offer letter.pdf", meta: "PDF · 240 KB" },
  { id: 2, name: "Aadhaar (masked).pdf", meta: "PDF · 118 KB" },
  { id: 3, name: "PAN card.pdf", meta: "PDF · 96 KB" },
  { id: 4, name: "Form 16 · FY 25-26.pdf", meta: "PDF · 310 KB" },
];

export type LogRow = { day: string; in: string; out: string; hrs: string; status: string };

export const ATT_LOG: LogRow[] = [
  { day: "Fri 21 Aug", in: "—", out: "—", hrs: "—", status: "Pending" },
  { day: "Thu 20 Aug", in: "—", out: "—", hrs: "—", status: "Leave" },
  { day: "Wed 19 Aug", in: "09:48", out: "13:30", hrs: "3.7", status: "Half-day" },
  { day: "Tue 18 Aug", in: "09:12", out: "18:40", hrs: "9.4", status: "Present" },
  { day: "Mon 17 Aug", in: "09:04", out: "18:22", hrs: "9.3", status: "Present" },
  { day: "Fri 14 Aug", in: "09:02", out: "17:58", hrs: "8.9", status: "Present" },
  { day: "Thu 13 Aug", in: "—", out: "—", hrs: "—", status: "Absent" },
  { day: "Wed 12 Aug", in: "09:21", out: "18:30", hrs: "9.1", status: "Present" },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// minutes past midnight -> "09:04"
function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// deterministic month log. index patterns, zero rng. aug keeps the hand data.
export function monthLog(m: number, year = 2026): LogRow[] {
  if (m === 7 && year === 2026) return ATT_LOG;
  const rows: LogRow[] = [];
  const d = new Date(year, m, 1);
  let i = 0;
  while (d.getMonth() === m) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const label = DOW[dow] + " " + d.getDate() + " " + MONTHS[m];
      if (i % 11 === 5) {
        rows.push({ day: label, in: "—", out: "—", hrs: "—", status: "Absent" });
      } else if (i % 9 === 4) {
        rows.push({ day: label, in: "—", out: "—", hrs: "—", status: "Leave" });
      } else {
        const half = i % 7 === 3;
        const inMin = 8 * 60 + 52 + ((i * 37) % 26);
        const shift = half ? 250 : 500 + ((i * 23) % 70);
        rows.push({
          day: label,
          in: hhmm(inMin),
          out: hhmm(inMin + shift),
          hrs: (shift / 60).toFixed(1),
          status: half ? "Half-day" : "Present",
        });
      }
      i++;
    }
    d.setDate(d.getDate() + 1);
  }
  return rows.reverse();
}

// rupee money, two decimals, indian grouping
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "2026-09-07" -> "7 Sep". bad input passes through untouched
export function shortDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.getDate() + " " + MONTHS[d.getMonth()];
}

// inclusive day count between two iso dates
export function dayspan(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  const n = Math.round((b - a) / 86_400_000) + 1;
  return Number.isNaN(n) || n < 1 ? 0 : n;
}

export type PayComponent = { id: number; label: string; note: string; type: string; value: string; amount: string };
export type Deduction = { id: number; label: string; note: string; value: string; amount: string };

export type Lop = {
  workingDays: number;
  lossDays: number;
  payableDays: number;
  amount: string;
};

export type Payroll = {
  comps: PayComponent[];
  deds: Deduction[];
  gross: string;
  net: string;
  ctc: string;
  month: string;
  year: string;
  lop?: Lop;
};

// days the payslip actually pays for. unpaid leave and absents already removed
export type DayCount = { workingDays: number; lossDays: number; payableDays: number };

// whole salary structure falls out of one monthly wage number. days trim the net
export function payrollFor(wage: number, days?: DayCount): Payroll {
  const w = Number.isFinite(wage) ? wage : 0;
  const basic = w * 0.5;
  const hra = basic * 0.5;
  const std = 4167;
  const bonus = basic * 0.0833;
  const lta = basic * 0.0833;
  const fixedAll = Math.max(0, w - (basic + hra + std + bonus + lta));
  const pfE = basic * 0.12;
  const pfC = basic * 0.12;
  const ptax = 200;

  // loss of pay: wage split over the month's working days, times the days lost
  const perDay = days && days.workingDays > 0 ? w / days.workingDays : 0;
  const lossDays = days ? days.lossDays : 0;
  const lopAmount = Math.round(perDay * lossDays);

  const deds: Deduction[] = [
    { id: 1, label: "Provident fund — employee", note: "12% of basic salary", value: "12.00 %", amount: "−" + inr(pfE) },
    { id: 2, label: "Provident fund — employer", note: "12% of basic, company share", value: "12.00 %", amount: inr(pfC) },
    { id: 3, label: "Professional tax", note: "Karnataka slab, flat monthly", value: "Fixed", amount: "−" + inr(ptax) },
  ];
  if (days && lossDays > 0) {
    deds.push({
      id: 4,
      label: "Loss of pay",
      note: `${lossDays} unpaid of ${days.workingDays} working days`,
      value: `${days.payableDays}/${days.workingDays} days`,
      amount: "−" + inr(lopAmount),
    });
  }

  return {
    comps: [
      { id: 1, label: "Basic salary", note: "Computed from the monthly wage", type: "% of wage", value: "50.00 %", amount: inr(basic) },
      { id: 2, label: "House rent allowance", note: "50% of the basic salary", type: "% of basic", value: "50.00 %", amount: inr(hra) },
      { id: 3, label: "Standard allowance", note: "Predetermined fixed amount", type: "Fixed", value: "—", amount: inr(std) },
      { id: 4, label: "Performance bonus", note: "Variable, paid during payroll", type: "% of basic", value: "8.33 %", amount: inr(bonus) },
      { id: 5, label: "Leave travel allowance", note: "Covers employee travel expenses", type: "% of basic", value: "8.33 %", amount: inr(lta) },
      { id: 6, label: "Fixed allowance", note: "Wage minus every other component", type: "Balancing", value: "auto", amount: inr(fixedAll) },
    ],
    deds,
    gross: inr(w),
    net: inr(Math.max(0, w - pfE - ptax - lopAmount)),
    ctc: inr(w + pfC),
    month: inr(w),
    year: inr(w * 12),
    lop: days
      ? { workingDays: days.workingDays, lossDays, payableDays: days.payableDays, amount: inr(lopAmount) }
      : undefined,
  };
}
