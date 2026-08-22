"use client";

// employee landing: punch clock, week strip, balances, activity, pay peek.
import { useRouter } from "next/navigation";
import { CheckIcon, ClockIcon, ExitIcon, PlusIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { ACTIVITY, tone } from "@/lib/dayflow";

const BALANCES = [
  { label: "Paid time off", value: "18 / 24", pct: 75, color: "#3C58D8" },
  { label: "Sick leave", value: "4 / 7", pct: 57, color: "#6E56CF" },
  { label: "Unpaid", value: "no cap", pct: 0, color: "#3C58D8" },
];

export function EmployeeDashboard() {
  const s = useDayflow();
  const router = useRouter();

  const line =
    s.checked === 0
      ? "You haven't checked in yet. One tap starts the day."
      : s.checked === 1
        ? `Checked in at ${s.inAt}. Have a good one.`
        : `Day closed at ${s.outAt}. Nothing left to do here.`;

  // friday flips between "today" and the real punch time
  const week = [
    { dow: "MON", date: "17", short: "09:04", s: "Present" },
    { dow: "TUE", date: "18", short: "09:12", s: "Present" },
    { dow: "WED", date: "19", short: "half", s: "Half-day" },
    { dow: "THU", date: "20", short: "sick", s: "Leave" },
    { dow: "FRI", date: "21", short: s.checked ? (s.inAt ?? "in") : "today", s: s.checked ? "Present" : "Today" },
    { dow: "SAT", date: "22", short: "—", s: "Weekend" },
    { dow: "SUN", date: "23", short: "—", s: "Weekend" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))" }}>
        {/* punch card */}
        <div className="df-card df-card-lift" style={{ padding: 24 }}>
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="df-kicker" style={{ margin: 0 }}>
                FRIDAY 21 AUGUST 2026
              </p>
              <h2 style={{ margin: "11px 0 0", font: "600 27px/1.14 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
                Good morning, Aarav
              </h2>
              <p style={{ margin: "8px 0 0", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
                {line}
              </p>
            </div>
            <div className="flex-none text-right">
              <div className="df-mono" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1, letterSpacing: "-.02em" }}>
                {s.clock}
              </div>
              <div className="df-mono" style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--df-ink5)" }}>
                IST · Bengaluru
              </div>
            </div>
          </div>

          <div className="mt-[22px] flex flex-wrap items-center gap-2.5">
            {s.checked === 0 ? (
              <button type="button" onClick={s.checkIn} className="df-btn df-btn-primary" style={{ padding: "13px 22px", fontSize: 14.5, borderRadius: 14 }}>
                <ClockIcon size={16} />
                Check in
              </button>
            ) : null}
            {s.checked === 1 ? (
              <button type="button" onClick={s.checkOut} className="df-btn df-btn-outline" style={{ padding: "13px 22px", fontSize: 14.5, borderRadius: 14 }}>
                <ExitIcon size={16} />
                Check out
              </button>
            ) : null}
            {s.checked === 2 ? (
              <span
                className="inline-flex items-center gap-[9px]"
                style={{
                  padding: "13px 20px",
                  borderRadius: 14,
                  background: "rgba(15,138,95,.09)",
                  border: "1px solid rgba(15,138,95,.2)",
                  font: "500 14px/1 var(--font-geist-sans)",
                  color: "var(--df-green-lo)",
                }}
              >
                <CheckIcon size={15} />
                Day logged · 8h 36m
              </span>
            ) : null}

            <button type="button" onClick={s.openLeave} className="df-btn df-btn-quiet" style={{ padding: "13px 18px", fontSize: 14, borderRadius: 14 }}>
              <PlusIcon size={15} />
              Request time off
            </button>

            <div className="df-mono ml-auto flex items-center gap-2.5" style={{ fontSize: 12.5, color: "var(--df-ink4)" }}>
              <span>in {s.inAt ?? "—"}</span>
              <span style={{ color: "#D9DCE1" }}>/</span>
              <span>out {s.outAt ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* week strip */}
        <div className="df-card" style={{ padding: 22 }}>
          <div className="flex items-baseline justify-between">
            <h3 className="df-h3">This week</h3>
            <span className="df-mono" style={{ fontSize: 12, color: "var(--df-ink5)" }}>
              17–23 Aug
            </span>
          </div>
          <div className="mt-[18px] grid gap-[7px]" style={{ gridTemplateColumns: "repeat(7,1fr)" }}>
            {week.map((d) => {
              const t = tone(d.s);
              return (
                <div key={d.dow} className="text-center">
                  <div style={{ font: "500 10.5px/1 var(--font-geist-sans)", letterSpacing: ".04em", color: "var(--df-ink5)" }}>
                    {d.dow}
                  </div>
                  <div
                    className="df-mono mt-2 grid place-items-center"
                    style={{
                      height: 46,
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 500,
                      background: t.bg,
                      border: `1px solid ${t.bd}`,
                      color: t.fg,
                    }}
                  >
                    {d.date}
                  </div>
                  <div style={{ margin: "7px 0 0", font: "450 10.5px/1 var(--font-geist-sans)", color: "var(--df-ink5)" }}>
                    {d.short}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-4" style={{ paddingTop: 14, borderTop: "1px solid rgba(16,19,23,.07)" }}>
            {[
              { v: s.checked === 2 ? "31.0" : "22.4", c: "Hours logged" },
              { v: "09:11", c: "Avg check-in" },
              { v: "18", c: "Paid days left" },
            ].map((x) => (
              <div key={x.c} className="flex-1">
                <div className="df-mono" style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-.01em" }}>
                  {x.v}
                </div>
                <div style={{ margin: "6px 0 0", font: "450 11.5px/1.3 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                  {x.c}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
        {/* balances */}
        <div className="df-card" style={{ padding: 20, borderRadius: 18 }}>
          <p className="df-kicker" style={{ margin: "0 0 16px" }}>
            Leave balance
          </p>
          <div className="flex flex-col gap-[15px]">
            {BALANCES.map((b) => (
              <div key={b.label}>
                <div
                  className="mb-2 flex justify-between"
                  style={{ font: "450 13px/1 var(--font-geist-sans)", color: "var(--df-ink2)" }}
                >
                  <span>{b.label}</span>
                  <span className="df-mono" style={{ color: "var(--df-ink5)" }}>
                    {b.value}
                  </span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "rgba(16,19,23,.07)", overflow: "hidden" }}>
                  <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* activity */}
        <div className="df-card" style={{ padding: 20, borderRadius: 18 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            Recent activity
          </p>
          <div className="flex flex-col gap-[2px]">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="df-row flex items-start gap-[11px]" style={{ padding: "9px 8px", borderRadius: 10, borderTop: "none" }}>
                <span style={{ flex: "none", width: 7, height: 7, marginTop: 5, borderRadius: "50%", background: a.dot }} />
                <span className="min-w-0 flex-1">
                  <span style={{ display: "block", font: "450 13px/1.35 var(--font-geist-sans)" }}>{a.title}</span>
                  <span className="df-mono" style={{ display: "block", marginTop: 2, fontSize: 11.5, color: "var(--df-ink5)" }}>
                    {a.meta}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* pay peek */}
        <div className="df-card flex flex-col" style={{ padding: 20, borderRadius: 18 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            Pay · August
          </p>
          <div className="df-mono" style={{ fontSize: 27, fontWeight: 500, lineHeight: 1, letterSpacing: "-.02em" }}>
            ₹73,640
          </div>
          <p style={{ margin: "8px 0 0", font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
            Net, credited on the 30th. Structure last revised 01 Apr 2026.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Basic 48,000", "HRA 19,200", "PF −5,760"].map((chip) => (
              <span
                key={chip}
                className="df-mono"
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "rgba(16,19,23,.05)",
                  fontSize: 11.5,
                  fontWeight: 450,
                  color: "var(--df-ink3)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push("/pay")}
            className="df-btn df-btn-outline"
            style={{ margin: "auto 0 0", alignSelf: "flex-start", padding: "9px 15px", borderRadius: 11, fontSize: 13 }}
          >
            View breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
