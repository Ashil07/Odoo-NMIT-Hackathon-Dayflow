"use client";

// my own daily log, straight from the server. week shows five rows, month the lot.
import { Stat, StatusPill } from "@/components/app/bits";
import { useDayflow } from "@/components/app/store";

export function EmployeeAttendance() {
  const s = useDayflow();

  const rows = s.range === "week" ? s.myLog.slice(0, 5) : s.myLog;

  const present = s.myLog.filter((r) => r.status === "Present").length;
  const half = s.myLog.filter((r) => r.status === "Half-day").length;
  const leave = s.myLog.filter((r) => r.status === "Leave").length;
  const hours = s.myLog.reduce((sum, r) => sum + (Number(r.hrs) || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        <Stat value={String(present)} caption="Present this month" color="var(--df-green-lo)" />
        <Stat value={String(half)} caption="Half-day" color="var(--df-amber-lo)" />
        <Stat value={String(leave)} caption="On leave" color="var(--df-violet-lo)" />
        <Stat value={hours ? hours.toFixed(1) : "—"} caption="Hours logged" />
      </div>

      <div className="df-card overflow-hidden">
        <div className="flex items-center gap-3.5" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
          <h3 className="df-h3">Daily log</h3>
          <div className="df-seg ml-auto">
            <button type="button" className="df-seg-btn" data-on={s.range === "week"} onClick={() => s.setRange("week")}>
              Week
            </button>
            <button type="button" className="df-seg-btn" data-on={s.range === "month"} onClick={() => s.setRange("month")}>
              Month
            </button>
          </div>
        </div>

        <div className="df-head grid gap-3 overflow-x-auto" style={{ gridTemplateColumns: "1.4fr .8fr .8fr .8fr .8fr 1fr", padding: "10px 20px" }}>
          <span>Date</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Work hours</span>
          <span>Extra</span>
          <span>Status</span>
        </div>

        {rows.map((r) => (
          <div
            key={r.day}
            className="df-row grid items-center gap-3"
            style={{ gridTemplateColumns: "1.4fr .8fr .8fr .8fr .8fr 1fr", padding: "13px 20px" }}
          >
            <span style={{ font: "450 13.5px/1.3 var(--font-geist-sans)" }}>{r.day}</span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {r.in}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {r.out}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {r.hrs}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-green-lo)" }}>
              {extraOf(r.hrs)}
            </span>
            <StatusPill status={r.status} style={{ justifySelf: "start" }} />
          </div>
        ))}
        {rows.length === 0 ? (
          <div style={{ padding: "26px 20px", font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
            No days logged yet. Check in from the dashboard.
          </div>
        ) : null}
      </div>
    </div>
  );
}

// +x.x over 8.5 hours, else quiet
function extraOf(hrs: string): string {
  const h = Number(hrs);
  if (Number.isNaN(h)) return "—";
  return h > 8.5 ? "+" + (h - 8.5).toFixed(1) : "—";
}
