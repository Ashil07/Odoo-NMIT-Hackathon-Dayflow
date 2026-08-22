"use client";

// my own daily log. month picker walks the year, week shows five rows.
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/app/icons";
import { Stat, StatusPill } from "@/components/app/bits";
import { useDayflow } from "@/components/app/store";
import { MONTHS, monthLog } from "@/lib/dayflow";

const YEAR = 2026;
const AUG = 7; // demo "now". hand data lives here.

export function EmployeeAttendance() {
  const s = useDayflow();
  const [cursor, setCursor] = useState(AUG);

  const log = useMemo(() => monthLog(cursor, YEAR), [cursor]);

  // today's row mirrors the punch clock, aug only
  const source = log.map((r, i) =>
    cursor === AUG && i === 0
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

  const present = log.filter((r) => r.status === "Present").length;
  const leaves = log.filter((r) => r.status === "Leave").length;
  const working = log.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="flex items-center gap-1.5"
          style={{ padding: 6, borderRadius: 14, background: "#fff", border: "1px solid rgba(16,19,23,.1)", boxShadow: "0 1px 2px rgba(16,19,23,.04)" }}
        >
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => (c + 11) % 12)}
            className="grid place-items-center"
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "var(--df-ink2)" }}
          >
            <ChevronLeft size={15} />
          </button>
          <select
            aria-label="Month"
            value={cursor}
            onChange={(e) => setCursor(Number(e.target.value))}
            style={{ border: "none", background: "transparent", font: "500 13.5px/1 var(--font-geist-sans)", letterSpacing: "-.006em", cursor: "pointer", outline: "none" }}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m} {YEAR}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => (c + 1) % 12)}
            className="grid place-items-center"
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "var(--df-ink2)" }}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="df-seg">
          <button type="button" className="df-seg-btn" data-on={s.range === "week"} onClick={() => s.setRange("week")}>
            Week
          </button>
          <button type="button" className="df-seg-btn" data-on={s.range === "month"} onClick={() => s.setRange("month")}>
            Month
          </button>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        <Stat value={String(present)} caption="Days present" color="var(--df-green-lo)" />
        <Stat value={String(leaves)} caption="Leaves taken" color="var(--df-violet-lo)" />
        <Stat value={String(working)} caption="Total working days" />
      </div>

      <div className="df-card overflow-hidden">
        <div className="flex items-center gap-3.5" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
          <h3 className="df-h3">Daily log</h3>
          <span className="df-mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--df-ink4)" }}>
            {MONTHS[cursor]} {YEAR}
          </span>
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
