"use client";

// employee landing: punch clock, week strip, balances, activity, pay peek.
import { useRouter } from "next/navigation";
import { CheckIcon, ClockIcon, ExitIcon, PlusIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { payrollFor, tone } from "@/lib/dayflow";

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function EmployeeDashboard() {
  const s = useDayflow();
  const router = useRouter();
  const me = s.me!;

  const dateLine = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const line =
    s.checked === 0
      ? "You haven't checked in yet. One tap starts the day."
      : s.checked === 1
        ? `Checked in at ${s.inAt}. Have a good one.`
        : `Day closed at ${s.outAt}. Nothing left to do here.`;

  // this week's strip falls out of the log: mon..sun around today
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const row = s.myLog.find((r) => r.day === `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`);
    const isToday = d.toDateString() === now.toDateString();
    const status = isToday
      ? s.checked
        ? "Present"
        : "Today"
      : row
        ? row.status
        : "Weekend";
    return {
      dow: DOW[d.getDay()],
      date: String(d.getDate()),
      short: isToday ? (s.inAt ?? "today") : row && row.in !== "—" ? row.in : "—",
      s: status,
    };
  });

  const weekKeys = new Set(
    week.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    }),
  );
  const weekHours = s.myLog
    .filter((r) => weekKeys.has(r.day))
    .reduce((sum, r) => sum + (Number(r.hrs) || 0), 0);
  const weekIns = s.myLog.filter((r) => r.in !== "—").map((r) => r.in);
  const avgIn = weekIns.length
    ? weekIns.reduce((acc, t) => {
        const [h, m] = t.split(":").map(Number);
        return acc + h * 60 + m;
      }, 0) / weekIns.length
    : null;
  const avgInText = avgIn
    ? `${String(Math.floor(avgIn / 60)).padStart(2, "0")}:${String(Math.round(avgIn % 60)).padStart(2, "0")}`
    : "—";

  // balances from my own approved leaves
  const used = (prefix: string) =>
    s.requests
      .filter((r) => r.status === "Approved" && r.type.startsWith(prefix))
      .reduce((sum, r) => sum + r.days, 0);
  const paidLeft = Math.max(0, 24 - used("Paid"));
  const sickLeft = Math.max(0, 7 - used("Sick"));
  const BALANCES = [
    { label: "Paid time off", value: `${paidLeft} / 24`, pct: Math.round((paidLeft / 24) * 100), color: "#3C58D8" },
    { label: "Sick leave", value: `${sickLeft} / 7`, pct: Math.round((sickLeft / 7) * 100), color: "#6E56CF" },
    { label: "Unpaid", value: "no cap", pct: 0, color: "#3C58D8" },
  ];

  const pay = s.myPayroll ?? payrollFor(s.myWage);
  const basic = pay.comps[0].amount.replace("₹", "");
  const hra = pay.comps[1].amount.replace("₹", "");
  const pf = pay.deds[0].amount.replace("−₹", "");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))" }}>
        {/* punch card */}
        <div className="df-card df-card-lift" style={{ padding: 24 }}>
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="df-kicker" style={{ margin: 0 }}>
                {dateLine.toUpperCase()}
              </p>
              <h2 style={{ margin: "11px 0 0", font: "600 27px/1.14 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
                Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, {me.name.split(" ")[0]}
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
                IST · {me.profile.location || "India"}
              </div>
            </div>
          </div>

          <div className="mt-[22px] flex flex-wrap items-center gap-2.5">
            {s.checked === 0 ? (
              <button type="button" onClick={() => void s.checkIn()} className="df-btn df-btn-primary" style={{ padding: "13px 22px", fontSize: 14.5, borderRadius: 14 }}>
                <ClockIcon size={16} />
                Check in
              </button>
            ) : null}
            {s.checked === 1 ? (
              <button type="button" onClick={() => void s.checkOut()} className="df-btn df-btn-outline" style={{ padding: "13px 22px", fontSize: 14.5, borderRadius: 14 }}>
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
                Day logged{todayHours(s.myLog) ? " · " + todayHours(s.myLog) + "h" : ""}
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
              {week[0].date}–{week[6].date} {MONTHS[monday.getMonth()]}
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
              { v: weekHours ? weekHours.toFixed(1) : "—", c: "Hours logged" },
              { v: avgInText, c: "Avg check-in" },
              { v: String(paidLeft), c: "Paid days left" },
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

        {/* my requests, quick view */}
        <div className="df-card" style={{ padding: 20, borderRadius: 18 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            My recent requests
          </p>
          <div className="flex flex-col gap-[2px]">
            {s.requests.slice(0, 4).map((r) => (
              <div key={r.id} className="df-row flex items-start gap-[11px]" style={{ padding: "9px 8px", borderRadius: 10, borderTop: "none" }}>
                <span
                  style={{
                    flex: "none",
                    width: 7,
                    height: 7,
                    marginTop: 5,
                    borderRadius: "50%",
                    background: r.status === "Approved" ? "#0F8A5F" : r.status === "Rejected" ? "#C6423C" : "#B4720A",
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span style={{ display: "block", font: "450 13px/1.35 var(--font-geist-sans)" }}>
                    {r.type} · {r.range}
                  </span>
                  <span className="df-mono" style={{ display: "block", marginTop: 2, fontSize: 11.5, color: "var(--df-ink5)" }}>
                    {r.status.toUpperCase()}
                  </span>
                </span>
              </div>
            ))}
            {s.requests.length === 0 ? (
              <p style={{ margin: 0, font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                Nothing filed yet. Time off is one tap away.
              </p>
            ) : null}
          </div>
        </div>

        {/* pay peek */}
        <div className="df-card flex flex-col" style={{ padding: 20, borderRadius: 18 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            Pay · this month
          </p>
          <div className="df-mono" style={{ fontSize: 27, fontWeight: 500, lineHeight: 1, letterSpacing: "-.02em" }}>
            {pay.net}
          </div>
          <p style={{ margin: "8px 0 0", font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
            Net take-home, from a monthly wage of {pay.gross}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[`Basic ${basic}`, `HRA ${hra}`, `PF −${pf}`].map((chip) => (
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

// hours string for today's row, if closed
function todayHours(log: { day: string; hrs: string }[]): string | null {
  const fmt = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const row = log.find((r) => r.day === fmt);
  return row && row.hrs !== "—" ? row.hrs : null;
}
