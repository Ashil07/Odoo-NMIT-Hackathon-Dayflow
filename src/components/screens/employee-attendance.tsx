"use client";

// my own daily log. week shows five rows, month shows the lot.
import { Stat, StatusPill } from "@/components/app/bits";
import { useDayflow } from "@/components/app/store";
import { ATT_LOG } from "@/lib/dayflow";

export function EmployeeAttendance() {
  const s = useDayflow();

  // today's row mirrors the punch clock
  const source = ATT_LOG.map((r, i) =>
    i === 0
      ? {
          ...r,
          in: s.inAt ?? "—",
          out: s.outAt ?? "—",
          hrs: s.checked === 2 ? "8.6" : "—",
          status: s.checked ? "Present" : "Pending",
        }
      : r,
  );

  const rows = (s.range === "week" ? source.slice(0, 5) : source).map((r) => {
    const h = Number(r.hrs);
    return { ...r, extra: Number.isNaN(h) ? "—" : h > 8.5 ? "+" + (h - 8.5).toFixed(1) : "—" };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        <Stat value="15" caption="Present in August" color="var(--df-green-lo)" />
        <Stat value="1" caption="Half-day" color="var(--df-amber-lo)" />
        <Stat value="2" caption="On leave" color="var(--df-violet-lo)" />
        <Stat value="142.5" caption="Hours logged" />
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
              {r.extra}
            </span>
            <StatusPill status={r.status} style={{ justifySelf: "start" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
