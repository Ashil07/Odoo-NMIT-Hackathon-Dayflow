"use client";

// whole-company register for one day. click a row, drawer opens.
import { useState } from "react";
import { Avatar, StatusPill } from "@/components/app/bits";
import { ChevronLeft, ChevronRight, SearchIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { MONTHS, PEOPLE } from "@/lib/dayflow";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// demo "today". arrows walk weekdays around it.
const ANCHOR = new Date(2026, 7, 21);

export function AdminAttendance() {
  const s = useDayflow();
  const [day, setDay] = useState(0);
  const q = s.search.trim().toLowerCase();
  const rows = PEOPLE.filter(
    (p) => !q || `${p.name} ${p.dept} ${p.role} ${p.id}`.toLowerCase().includes(q),
  );

  // step one weekday at a time, clamp to the demo week
  const step = (dir: number) => {
    setDay((d) => {
      let next = d + dir;
      if (next < -4 || next > 0) return d;
      let dt = new Date(ANCHOR);
      dt.setDate(dt.getDate() + next);
      while (dt.getDay() === 0 || dt.getDay() === 6) {
        next += dir;
        if (next < -4 || next > 0) return d;
        dt = new Date(ANCHOR);
        dt.setDate(dt.getDate() + next);
      }
      return next;
    });
  };

  const dt = new Date(ANCHOR);
  dt.setDate(dt.getDate() + day);
  const label = `${DOW[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="flex items-center gap-1.5"
          style={{ padding: 6, borderRadius: 14, background: "#fff", border: "1px solid rgba(16,19,23,.1)", boxShadow: "0 1px 2px rgba(16,19,23,.04)" }}
        >
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => step(-1)}
            className="grid place-items-center"
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "var(--df-ink2)" }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ padding: "0 8px", font: "500 13.5px/1 var(--font-geist-sans)", letterSpacing: "-.006em" }}>
            {label}
          </span>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => step(1)}
            className="grid place-items-center"
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "var(--df-ink2)" }}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="df-seg">
          <button type="button" className="df-seg-btn" data-on={s.range === "week"} onClick={() => s.setRange("week")}>
            Day
          </button>
          <button type="button" className="df-seg-btn" data-on={s.range === "month"} onClick={() => s.setRange("month")}>
            Month
          </button>
        </div>

        <div
          className="flex min-w-[200px] flex-1 items-center gap-2.5"
          style={{ padding: "11px 14px", borderRadius: 14, background: "#fff", border: "1px solid rgba(16,19,23,.1)" }}
        >
          <SearchIcon size={15} style={{ color: "var(--df-ink5)" }} />
          <input
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder="Filter employees"
            className="min-w-0 flex-1 bg-transparent outline-none"
            style={{ font: "400 13.5px/1.2 var(--font-geist-sans)", border: "none" }}
          />
        </div>

        <button type="button" onClick={() => s.toast("Register exported to CSV")} className="df-btn df-btn-outline" style={{ borderRadius: 14, padding: "12px 18px" }}>
          Export register
        </button>
      </div>

      <div className="df-card overflow-hidden">
        <div className="df-head grid gap-3" style={{ gridTemplateColumns: "1.7fr .8fr .8fr .8fr .8fr 1fr", padding: "11px 20px" }}>
          <span>Employee</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Work hours</span>
          <span>Extra</span>
          <span>Status</span>
        </div>

        {rows.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              s.setTab("resume");
              s.select(p.id);
            }}
            className="df-row grid cursor-pointer items-center gap-3"
            style={{ gridTemplateColumns: "1.7fr .8fr .8fr .8fr .8fr 1fr", padding: "13px 20px" }}
          >
            <span className="flex min-w-0 items-center gap-[11px]">
              <Avatar name={p.name} size={28} />
              <span className="min-w-0">
                <span className="block truncate" style={{ font: "450 13.5px/1.3 var(--font-geist-sans)" }}>
                  {p.name}
                </span>
                <span className="df-mono block" style={{ fontSize: 11, color: "var(--df-ink6)" }}>
                  {p.id}
                </span>
              </span>
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {p.in}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {p.out}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-ink2)" }}>
              {p.hrs}
            </span>
            <span className="df-mono" style={{ fontSize: 13, color: "var(--df-green-lo)" }}>
              {p.extra}
            </span>
            <StatusPill status={p.st} style={{ justifySelf: "start" }} />
          </div>
        ))}

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(16,19,23,.06)",
            background: "#FAFBFC",
            font: "400 12.5px/1.5 var(--font-geist-sans)",
            color: "var(--df-ink4)",
          }}
        >
          Attendance is the basis for payslip days. Unpaid leave and missing days reduce the payable days automatically.
        </div>
      </div>
    </div>
  );
}
