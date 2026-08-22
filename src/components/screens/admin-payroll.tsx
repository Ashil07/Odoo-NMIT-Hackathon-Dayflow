"use client";

// wage in, whole structure out. fixed allowance eats the remainder.
import { Avatar } from "@/components/app/bits";
import { useDayflow } from "@/components/app/store";
import { payrollFor } from "@/lib/dayflow";

const SCHEDULE = [
  ["Working days", "Mon – Fri"],
  ["Hours", "09:00 – 18:00"],
  ["Break", "01:00"],
  ["Days per week", "5"],
  ["Payable days, this month", "21 of 22"],
];

export function AdminPayroll() {
  const s = useDayflow();
  const target = s.payrollTarget;
  const pay = payrollFor(Number(s.wage) || 0);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
      <div className="flex flex-col gap-4">
        <div className="df-card" style={{ padding: 22 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            Employee
          </p>
          <select
            className="df-input"
            style={{ padding: "11px 13px", fontSize: 13.5 }}
            value={target?.id ?? ""}
            onChange={(e) => s.choosePayrollTarget(e.target.value)}
          >
            {s.payrollList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} · {w.empId}
              </option>
            ))}
          </select>
          {target ? (
            <div className="mt-3 flex items-center gap-3" style={{ padding: 12, borderRadius: 14, background: "#FAFBFC", border: "1px solid rgba(16,19,23,.06)" }}>
              <Avatar name={target.name} size={38} />
              <span className="min-w-0 flex-1">
                <span style={{ display: "block", font: "600 13.5px/1.3 var(--font-geist-sans)", letterSpacing: "-.006em" }}>
                  {target.name}
                </span>
                <span className="df-mono" style={{ display: "block", marginTop: 2, fontSize: 11.5, color: "var(--df-ink5)" }}>
                  {target.title} · {target.dept}
                </span>
              </span>
            </div>
          ) : null}

          <p className="df-kicker" style={{ margin: "22px 0 10px" }}>
            Wage type
          </p>
          <div className="df-seg flex">
            <button type="button" className="df-seg-btn" style={{ flex: 1, padding: "9px 10px" }} data-on={s.range === "week"} onClick={() => s.setRange("week")}>
              Monthly
            </button>
            <button type="button" className="df-seg-btn" style={{ flex: 1, padding: "9px 10px" }} data-on={s.range === "month"} onClick={() => s.setRange("month")}>
              Yearly
            </button>
          </div>

          <label className="df-label" style={{ margin: "18px 0 7px" }}>
            Monthly wage
          </label>
          <div className="flex items-center gap-2.5" style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(16,19,23,.14)", background: "#fff" }}>
            <span className="df-mono" style={{ fontSize: 15, fontWeight: 500, color: "var(--df-ink5)" }}>
              ₹
            </span>
            <input
              value={s.wage}
              onChange={(e) => s.setWage(e.target.value)}
              inputMode="numeric"
              className="df-mono min-w-0 flex-1 bg-transparent outline-none"
              style={{ border: "none", fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}
            />
            <span style={{ font: "400 12px/1 var(--font-geist-sans)", color: "var(--df-ink5)" }}>/ month</span>
          </div>

          <div className="mt-3 flex gap-2.5">
            {[
              { k: "Month", v: pay.month },
              { k: "Year", v: pay.year },
            ].map((box) => (
              <div key={box.k} className="flex-1" style={{ padding: 12, borderRadius: 12, background: "#FAFBFC", border: "1px solid rgba(16,19,23,.06)" }}>
                <div className="df-kicker" style={{ fontSize: 10.5 }}>
                  {box.k}
                </div>
                <div className="df-mono" style={{ margin: "7px 0 0", fontSize: 14, fontWeight: 500 }}>
                  {box.v}
                </div>
              </div>
            ))}
          </div>

          <p style={{ margin: "14px 0 0", font: "400 12.5px/1.55 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
            Change the wage and every component below recomputes. Their total can never exceed the wage — the fixed
            allowance absorbs the difference.
          </p>
        </div>

        <div className="df-card" style={{ padding: 22 }}>
          <p className="df-kicker" style={{ margin: "0 0 15px" }}>
            Working schedule
          </p>
          <div className="flex flex-col gap-[11px]" style={{ font: "450 13px/1 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
            {SCHEDULE.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="df-mono" style={{ color: "var(--df-ink)" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="df-card overflow-hidden">
          <div className="flex items-baseline gap-3" style={{ padding: "18px 22px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
            <h3 className="df-h3">Salary components</h3>
            <span className="df-mono ml-auto" style={{ fontSize: 12, color: "var(--df-ink5)" }}>
              auto-computed
            </span>
          </div>
          <div className="df-head grid gap-3" style={{ gridTemplateColumns: "2fr 1fr .8fr 1.1fr", padding: "10px 22px" }}>
            <span>Component</span>
            <span>Computation</span>
            <span>Value</span>
            <span className="text-right">Amount</span>
          </div>
          {pay.comps.map((c) => (
            <div key={c.id} className="df-row grid items-center gap-3" style={{ gridTemplateColumns: "2fr 1fr .8fr 1.1fr", padding: "13px 22px" }}>
              <span className="min-w-0">
                <span style={{ display: "block", font: "450 13.5px/1.3 var(--font-geist-sans)" }}>{c.label}</span>
                <span style={{ display: "block", marginTop: 2, font: "400 11.5px/1.35 var(--font-geist-sans)", color: "var(--df-ink5)" }}>
                  {c.note}
                </span>
              </span>
              <span style={{ font: "400 12.5px/1.3 var(--font-geist-sans)", color: "var(--df-ink3)" }}>{c.type}</span>
              <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink3)" }}>
                {c.value}
              </span>
              <span className="df-mono text-right" style={{ fontSize: 13.5, fontWeight: 500 }}>
                {c.amount}
              </span>
            </div>
          ))}
          <div
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: "2fr 1fr .8fr 1.1fr", padding: "15px 22px", borderTop: "1px solid rgba(16,19,23,.1)", background: "#FAFBFC" }}
          >
            <span style={{ font: "600 14px/1 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Gross · equals the wage</span>
            <span />
            <span />
            <span className="df-mono text-right" style={{ fontSize: 16, fontWeight: 500 }}>
              {pay.gross}
            </span>
          </div>
        </div>

        <div className="df-card overflow-hidden">
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
            <h3 className="df-h3">Contributions &amp; deductions</h3>
          </div>
          {pay.deds.map((d) => (
            <div key={d.id} className="df-row grid items-center gap-3" style={{ gridTemplateColumns: "2fr 1fr 1.1fr", padding: "13px 22px" }}>
              <span className="min-w-0">
                <span style={{ display: "block", font: "450 13.5px/1.3 var(--font-geist-sans)" }}>{d.label}</span>
                <span style={{ display: "block", marginTop: 2, font: "400 11.5px/1.35 var(--font-geist-sans)", color: "var(--df-ink5)" }}>
                  {d.note}
                </span>
              </span>
              <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink3)" }}>
                {d.value}
              </span>
              <span className="df-mono text-right" style={{ fontSize: 13.5, fontWeight: 500 }}>
                {d.amount}
              </span>
            </div>
          ))}
          <div
            className="flex flex-wrap gap-3.5"
            style={{ padding: "18px 22px", borderTop: "1px solid rgba(16,19,23,.1)", background: "#FAFBFC" }}
          >
            <div className="min-w-[150px] flex-1">
              <div className="df-kicker" style={{ fontSize: 10.5 }}>
                Net take-home
              </div>
              <div className="df-mono" style={{ margin: "8px 0 0", fontSize: 21, fontWeight: 500, letterSpacing: "-.014em" }}>
                {pay.net}
              </div>
            </div>
            <div className="min-w-[150px] flex-1">
              <div className="df-kicker" style={{ fontSize: 10.5 }}>
                Cost to company
              </div>
              <div className="df-mono" style={{ margin: "8px 0 0", fontSize: 21, fontWeight: 500, letterSpacing: "-.014em", color: "var(--df-ink3)" }}>
                {pay.ctc}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void s.saveWage()}
              className="df-btn df-btn-primary flex-none self-end"
              style={{ padding: "12px 20px" }}
            >
              Save structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
