// product shots for the marketing surface. not illustrations — these are the
// real dayflow screens rebuilt as markup, carrying the seed data the demo
// ships with. they keep the app typeface (geist) on purpose, so they read as
// screenshots sitting inside a page set in bricolage + public sans.
import type { CSSProperties, ReactNode } from "react";

const APP: CSSProperties = { fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" };
const MONO: CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  fontVariantNumeric: "tabular-nums",
};

// marketing keeps a four-tone status set. leave rides the brand indigo here
// rather than the app violet, so the page never drifts purple.
const TONE = {
  Present: { bg: "rgba(15,138,95,.1)", fg: "#0B6B49", dot: "#0F8A5F" },
  "Half-day": { bg: "rgba(180,114,10,.1)", fg: "#8E5A07", dot: "#B4720A" },
  Absent: { bg: "rgba(198,66,60,.1)", fg: "#A83A34", dot: "#C6423C" },
  Leave: { bg: "rgba(60,88,216,.1)", fg: "#2B41A8", dot: "#3C58D8" },
} as const;

type Status = keyof typeof TONE;

function Tag({ status }: { status: Status }) {
  const t = TONE[status];
  return (
    <span className="mk-tag" style={{ background: t.bg, color: t.fg }}>
      <span className="mk-dot" style={{ background: t.dot }} />
      {status}
    </span>
  );
}

function Face({ initials, tint, ink, size = 24 }: { initials: string; tint: string; ink: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid flex-none place-items-center rounded-full font-semibold"
      style={{ width: size, height: size, background: tint, color: ink, fontSize: size * 0.375, lineHeight: 1 }}
    >
      {initials}
    </span>
  );
}

/* ── 1. whole-company register — the hero shot ─────────────────────────── */

const ROWS = [
  { n: "Aarav Rao", t: "Product Designer", i: "AR", tint: "#DDE3F6", ink: "#2B41A8", id: "OIAARA20230012", in: "09:04", out: "—", hrs: "8.6", ex: "+0.6", st: "Present" },
  { n: "Meera Kulkarni", t: "Engineering Manager", i: "MK", tint: "#DDE3F6", ink: "#2B41A8", id: "OIMEKU20210004", in: "08:58", out: "—", hrs: "8.9", ex: "+0.9", st: "Present" },
  { n: "Tanvi Nair", t: "HR Officer", i: "TN", tint: "#E4E7EE", ink: "#3D434F", id: "OITANA20200008", in: "08:52", out: "—", hrs: "9.1", ex: "+1.1", st: "Present" },
  { n: "Sahil Verma", t: "Backend Engineer", i: "SV", tint: "#DDE3F6", ink: "#2B41A8", id: "OISAVE20230063", in: "—", out: "—", hrs: "—", ex: "—", st: "Leave" },
  { n: "Rohan Iyer", t: "QA Engineer", i: "RI", tint: "#E4E7EE", ink: "#3D434F", id: "OIROIY20240091", in: "09:48", out: "13:30", hrs: "3.7", ex: "—", st: "Half-day" },
  { n: "Diya Menon", t: "Accountant", i: "DM", tint: "#DEEAE4", ink: "#0B6B49", id: "OIDIME20230075", in: "09:20", out: "—", hrs: "8.2", ex: "+0.2", st: "Present" },
  { n: "Ishita Bose", t: "Frontend Engineer", i: "IB", tint: "#DEEAE4", ink: "#0B6B49", id: "OIISBO20240084", in: "09:31", out: "—", hrs: "8.0", ex: "—", st: "Present" },
  { n: "Kabir Shah", t: "Sales Lead", i: "KS", tint: "#E4E7EE", ink: "#3D434F", id: "OIKASH20220029", in: "—", out: "—", hrs: "—", ex: "—", st: "Absent" },
] as const;

const SIDE: Array<{ label: string; on?: boolean; count?: number }> = [
  { label: "Today", on: true },
  { label: "People" },
  { label: "Attendance" },
  { label: "Approvals", count: 3 },
  { label: "Payroll" },
];

const GRID =
  "grid items-center gap-3 grid-cols-[minmax(0,1.8fr)_0.72fr_0.56fr_0.92fr] " +
  "sm:grid-cols-[minmax(0,1.8fr)_0.72fr_0.72fr_0.56fr_0.92fr] " +
  "lg:grid-cols-[minmax(0,1.85fr)_1.05fr_0.7fr_0.7fr_0.56fr_0.5fr_0.88fr]";

export function RegisterShot() {
  return (
    <div className="mk-shot" style={APP}>
      <div className="flex">
        {/* the app sidebar. dropped below lg so the table keeps its columns. */}
        <aside
          className="hidden w-[212px] flex-none flex-col p-3 lg:flex"
          style={{ background: "#eceef2", borderRight: "1px solid rgba(11,13,18,.07)" }}
        >
          <div className="flex items-center gap-2 px-1 py-1">
            <span aria-hidden style={{ width: 16, height: 16, borderRadius: 5, background: "#3C58D8" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.014em" }}>Dayflow</span>
            <span
              className="ml-auto rounded px-1.5 py-1"
              style={{ ...MONO, fontSize: 9, fontWeight: 500, background: "rgba(11,13,18,.07)", color: "#5B626F" }}
            >
              HR
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-0.5">
            {SIDE.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  background: s.on ? "#3C58D8" : "transparent",
                  color: s.on ? "#fff" : "#3D434F",
                }}
              >
                {s.label}
                {s.count ? (
                  <span
                    className="ml-auto rounded-full px-1.5 py-0.5"
                    style={{ ...MONO, fontSize: 9, fontWeight: 600, background: "#F5E4C4", color: "#8E5A07" }}
                  >
                    {s.count}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-xl bg-white p-3" style={{ border: "1px solid rgba(11,13,18,.07)" }}>
            <p className="mk-th" style={{ margin: 0 }}>Pay run</p>
            <p style={{ ...MONO, margin: "7px 0 0", fontSize: 11.5, fontWeight: 500 }}>28 Aug · ready</p>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: "rgba(11,13,18,.09)" }}>
              <div style={{ width: "78%", height: "100%", background: "#0F8A5F" }} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1" style={{ background: "#f6f7f9" }}>
          <div className="flex flex-wrap items-end gap-3 px-4 pb-4 pt-5 sm:px-6">
            <div>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: "-0.026em" }}>Today at Dayflow</h3>
              <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "#5B626F" }}>8 employees · Friday 21 August</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <span
                className="rounded-lg bg-white px-3 py-2"
                style={{ fontSize: 11.5, fontWeight: 500, color: "#3D434F", border: "1px solid rgba(11,13,18,.12)" }}
              >
                Export register
              </span>
              <span
                className="rounded-lg px-3 py-2"
                style={{ fontSize: 11.5, fontWeight: 500, color: "#fff", background: "#3C58D8" }}
              >
                Add employee
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4 sm:px-6">
            {[
              { k: "Present", v: "5", c: "#0B6B49" },
              { k: "Half-day", v: "1", c: "#8E5A07" },
              { k: "On leave", v: "1", c: "#2B41A8" },
              { k: "Absent", v: "1", c: "#A83A34" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-white px-3 py-2.5" style={{ border: "1px solid rgba(11,13,18,.07)" }}>
                <p className="mk-th" style={{ margin: 0 }}>{s.k}</p>
                <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", color: s.c }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mx-4 mb-5 overflow-hidden rounded-xl bg-white sm:mx-6"
            style={{ border: "1px solid rgba(11,13,18,.07)" }}
          >
            <div
              className={`${GRID} px-4 py-2.5`}
              style={{ background: "#fafbfc", borderBottom: "1px solid rgba(11,13,18,.06)" }}
            >
              <span className="mk-th">Employee</span>
              <span className="mk-th hidden lg:block">Login ID</span>
              <span className="mk-th">Check in</span>
              <span className="mk-th hidden sm:block">Check out</span>
              <span className="mk-th">Hours</span>
              <span className="mk-th hidden lg:block">Extra</span>
              <span className="mk-th">Status</span>
            </div>
            {ROWS.map((r, idx) => (
              <div
                key={r.id}
                className={`${GRID} px-4 py-2.5`}
                style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(11,13,18,.055)" }}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Face initials={r.i} tint={r.tint} ink={r.ink} />
                  <span className="min-w-0">
                    <span className="block truncate" style={{ fontSize: 12.5, fontWeight: 500, color: "#0B0D12" }}>
                      {r.n}
                    </span>
                    <span className="block truncate" style={{ fontSize: 10.5, color: "#5B626F" }}>
                      {r.t}
                    </span>
                  </span>
                </span>
                <span className="mk-td hidden truncate lg:block" style={{ ...MONO, fontSize: 11 }}>
                  {r.id}
                </span>
                <span className="mk-td" style={MONO}>{r.in}</span>
                <span className="mk-td hidden sm:block" style={MONO}>{r.out}</span>
                <span className="mk-td" style={MONO}>{r.hrs}</span>
                <span
                  className="mk-td hidden lg:block"
                  style={{ ...MONO, color: r.ex === "—" ? "#6C727E" : "#8E5A07", fontWeight: r.ex === "—" ? 400 : 600 }}
                >
                  {r.ex}
                </span>
                <span>
                  <Tag status={r.st as Status} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 2. day-wise log, overtime counted ─────────────────────────────────── */

const WEEK = [
  { d: "Mon", date: "17 Aug", in: "09:04", out: "18:12", h: "9.1", ot: "+1.2h" },
  { d: "Tue", date: "18 Aug", in: "08:58", out: "19:40", h: "10.7", ot: "+2.7h" },
  { d: "Wed", date: "19 Aug", in: "09:11", out: "18:02", h: "8.8", ot: null },
  { d: "Thu", date: "20 Aug", in: "09:00", out: "20:05", h: "11.1", ot: "+3.1h" },
  { d: "Fri", date: "21 Aug", in: "09:04", out: "—", h: "8.6", ot: null },
];

export function WeekShot() {
  return (
    <div className="mk-shot" style={APP}>
      <div className="mk-shot-bar">
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.014em" }}>My attendance</span>
        <span style={{ fontSize: 11, color: "#5B626F" }}>August 2026</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          {["Week", "Month"].map((t, i) => (
            <span
              key={t}
              className="rounded-md px-2.5 py-1.5"
              style={{
                fontSize: 11,
                fontWeight: 500,
                background: i === 0 ? "#fff" : "transparent",
                color: i === 0 ? "#0B0D12" : "#5B626F",
                boxShadow: i === 0 ? "0 1px 2px rgba(11,13,18,.1)" : "none",
              }}
            >
              {t}
            </span>
          ))}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {WEEK.map((w, i) => (
          <div
            key={w.d}
            className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[52px_82px_minmax(0,1fr)_auto]"
            style={{ borderTop: i === 0 ? "none" : "1px solid rgba(11,13,18,.06)" }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0B0D12" }}>{w.d}</span>
            <span className="hidden sm:block" style={{ fontSize: 11.5, color: "#6C727E" }}>
              {w.date}
            </span>
            <span className="flex items-baseline gap-2" style={{ ...MONO, fontSize: 13.5, color: "#3D434F" }}>
              {w.in}
              <span style={{ color: "#6C727E" }}>&rarr;</span>
              {w.out}
              <span className="hidden md:inline" style={{ marginLeft: 10, fontSize: 11.5, color: "#6C727E" }}>
                {w.h} h
              </span>
            </span>
            <span className="justify-self-end">
              {w.ot ? (
                <span className="mk-tag" style={{ background: "rgba(180,114,10,.1)", color: "#8E5A07", ...MONO }}>
                  {w.ot}
                </span>
              ) : (
                <span style={{ ...MONO, fontSize: 11.5, color: "#6C727E" }}>—</span>
              )}
            </span>
          </div>
        ))}

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl px-4 py-3" style={{ background: "#f6f7f9" }}>
          <span style={{ fontSize: 11.5, color: "#5B626F" }}>Week total</span>
          <span style={{ ...MONO, fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>48.3 h</span>
          <span className="ml-auto" style={{ fontSize: 11.5, color: "#5B626F" }}>Overtime</span>
          <span style={{ ...MONO, fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "#8E5A07" }}>+7.0 h</span>
        </div>
      </div>
    </div>
  );
}

/* ── 3. leave queue and balances ───────────────────────────────────────── */

const QUEUE = [
  { n: "Rohan Iyer", i: "RI", tint: "#E4E7EE", ink: "#3D434F", type: "Sick", note: "2 days · certificate attached", range: "25 – 26 Aug" },
  { n: "Ishita Bose", i: "IB", tint: "#DEEAE4", ink: "#0B6B49", type: "Paid", note: "5 days · cover arranged", range: "01 – 05 Sep" },
  { n: "Sahil Verma", i: "SV", tint: "#DDE3F6", ink: "#2B41A8", type: "Unpaid", note: "1 day · comes out of the pay run", range: "29 Aug" },
];

export function ApprovalsShot() {
  return (
    <div className="mk-shot" style={APP}>
      <div className="mk-shot-bar">
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.014em" }}>Approvals</span>
        <span
          className="rounded-full px-2 py-1"
          style={{ ...MONO, fontSize: 9.5, fontWeight: 600, background: "#F5E4C4", color: "#8E5A07" }}
        >
          3 pending
        </span>
      </div>

      <div className="flex flex-col">
        {QUEUE.map((q, i) => (
          <div
            key={q.n}
            className="flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 sm:px-5"
            style={{ borderTop: i === 0 ? "none" : "1px solid rgba(11,13,18,.06)" }}
          >
            <Face initials={q.i} tint={q.tint} ink={q.ink} size={28} />
            <span className="min-w-0 flex-1">
              <span className="block" style={{ fontSize: 13, fontWeight: 600, color: "#0B0D12" }}>
                {q.n}
                <span style={{ fontWeight: 400, color: "#5B626F" }}> · {q.type}</span>
              </span>
              <span className="block" style={{ fontSize: 11.5, color: "#5B626F" }}>{q.note}</span>
            </span>
            <span className="hidden md:block" style={{ ...MONO, fontSize: 11.5, color: "#5B626F" }}>{q.range}</span>
            <span className="flex items-center gap-1.5">
              <span className="rounded-lg px-3 py-2" style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", background: "#0F8A5F" }}>
                Approve
              </span>
              <span
                className="rounded-lg px-3 py-2"
                style={{ fontSize: 11.5, fontWeight: 600, color: "#A83A34", background: "rgba(198,66,60,.08)" }}
              >
                Reject
              </span>
            </span>
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-2 gap-3 px-4 py-4 sm:px-5"
        style={{ background: "#f6f7f9", borderTop: "1px solid rgba(11,13,18,.06)" }}
      >
        {[
          { k: "Paid leave", used: 6, cap: 24, c: "#0F8A5F" },
          { k: "Sick leave", used: 2, cap: 7, c: "#3C58D8" },
        ].map((b) => (
          <div key={b.k}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontSize: 11.5, color: "#5B626F" }}>{b.k}</span>
              <span style={{ ...MONO, fontSize: 12, fontWeight: 600 }}>
                {b.cap - b.used}
                <span style={{ color: "#6C727E", fontWeight: 400 }}> / {b.cap} left</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(11,13,18,.09)" }}>
              <div style={{ width: `${((b.cap - b.used) / b.cap) * 100}%`, height: "100%", background: b.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 4. the payroll derivation ─────────────────────────────────────────── */

function PayLine({
  label,
  note,
  amount,
  negative,
  children,
}: {
  label: string;
  note?: string;
  amount: string;
  negative?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3" style={{ borderTop: "1px solid rgba(11,13,18,.06)" }}>
      <span className="min-w-0 flex-1">
        <span className="block" style={{ fontSize: 13, fontWeight: 500, color: "#0B0D12" }}>{label}</span>
        {note ? <span className="block" style={{ fontSize: 11, color: "#6C727E" }}>{note}</span> : null}
      </span>
      {children}
      <span style={{ ...MONO, fontSize: 13, fontWeight: 500, color: negative ? "#A83A34" : "#0B0D12" }}>{amount}</span>
    </div>
  );
}

export function PayrollShot() {
  return (
    <div className="mk-shot" style={APP}>
      <div className="mk-shot-bar">
        <Face initials="AR" tint="#DDE3F6" ink="#2B41A8" size={26} />
        <span className="min-w-0">
          <span className="block" style={{ fontSize: 12.5, fontWeight: 600 }}>Aarav Rao</span>
          <span className="block" style={{ ...MONO, fontSize: 10.5, color: "#6C727E" }}>OIAARA20230012</span>
        </span>
        <span
          className="ml-auto hidden rounded-lg px-3 py-2 sm:block"
          style={{ fontSize: 11, fontWeight: 600, background: "rgba(60,88,216,.1)", color: "#2B41A8" }}
        >
          Editing monthly wage
        </span>
      </div>

      <div className="px-4 pb-4 pt-1 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-4">
          <span className="min-w-0 flex-1">
            <span className="block" style={{ fontSize: 13, fontWeight: 600 }}>Monthly wage</span>
            <span className="block" style={{ fontSize: 11, color: "#6C727E" }}>the one number HR types</span>
          </span>
          <span
            className="rounded-lg px-3.5 py-2.5"
            style={{ ...MONO, fontSize: 15, fontWeight: 600, border: "1.5px solid #3C58D8", color: "#0B0D12" }}
          >
            ₹96,000
          </span>
        </div>

        <PayLine label="Basic salary" note="50% of the monthly wage" amount="₹48,000" />
        <PayLine label="House rent allowance" note="50% of basic" amount="₹24,000" />
        <PayLine label="Standard allowance" note="fixed" amount="₹4,167" />
        <PayLine label="Performance bonus" note="8.33% of basic" amount="₹3,998" />
        <PayLine label="Leave travel allowance" note="8.33% of basic" amount="₹3,998" />
        <PayLine label="Fixed allowance" note="wage minus every other component" amount="₹11,837" />
        <PayLine label="Provident fund — employee" note="12% of basic" amount="−₹5,760" negative />
        <PayLine label="Professional tax" note="Karnataka slab" amount="−₹200" negative />
        <PayLine label="Loss of pay" note="1 unpaid of 22 working days" amount="−₹4,364" negative />

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-4" style={{ background: "#f6f7f9" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Net pay</span>
          <span style={{ fontSize: 11.5, color: "#5B626F" }}>21 of 22 days payable</span>
          <span className="ml-auto" style={{ ...MONO, fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em" }}>
            ₹85,676
          </span>
        </div>
      </div>
    </div>
  );
}
