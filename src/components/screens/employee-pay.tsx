"use client";

// what the employee sees: their structure, frozen. plus payslip shelf.
import { InfoIcon, SlipIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { inr, PAYSLIPS } from "@/lib/dayflow";

export function EmployeePay() {
  const s = useDayflow();
  const pay = s.myPayroll;

  // read-only mirror of the hr editor, straight from the stored wage
  const rows = pay
    ? [
        { id: 1, label: "Basic salary", note: "50% of wage", amount: pay.comps[0].amount, fg: "#101317" },
        { id: 2, label: "House rent allowance", note: "50% of basic", amount: pay.comps[1].amount, fg: "#101317" },
        { id: 3, label: "Standard allowance", note: "fixed", amount: pay.comps[2].amount, fg: "#101317" },
        { id: 4, label: "Performance bonus", note: "8.33% of basic", amount: pay.comps[3].amount, fg: "#101317" },
        { id: 5, label: "Leave travel allowance", note: "8.33% of basic", amount: pay.comps[4].amount, fg: "#101317" },
        { id: 6, label: "Provident fund", note: "employee share", amount: pay.deds[0].amount, fg: "#A83A34" },
        { id: 7, label: "Professional tax", note: "flat monthly", amount: pay.deds[2].amount, fg: "#A83A34" },
        { id: 8, label: "Gross monthly", note: "before deductions", amount: pay.gross, fg: "#5C626C" },
      ]
    : [];

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
      <div className="df-card" style={{ padding: 24 }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="df-h3">Salary structure</h3>
          <span
            className="df-mono"
            style={{ padding: "4px 9px", borderRadius: 7, background: "rgba(16,19,23,.05)", fontSize: 10.5, fontWeight: 500, color: "var(--df-ink3)" }}
          >
            READ ONLY
          </span>
          <span className="df-mono ml-auto" style={{ fontSize: 12, color: "var(--df-ink5)" }}>
            Computed live from your wage
          </span>
        </div>

        <div className="mt-5 flex flex-col">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3.5" style={{ padding: "13px 0", borderBottom: "1px solid rgba(16,19,23,.06)" }}>
              <span className="min-w-0 flex-1" style={{ font: "450 13.5px/1.3 var(--font-geist-sans)", color: row.fg }}>
                {row.label}
              </span>
              <span className="df-mono flex-none" style={{ fontSize: 12, color: "var(--df-ink6)" }}>
                {row.note}
              </span>
              <span className="df-mono flex-none text-right" style={{ width: 112, fontSize: 14, fontWeight: 500, color: row.fg }}>
                {row.amount}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3.5" style={{ padding: "18px 0 0" }}>
            <span style={{ flex: 1, font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.008em" }}>Net monthly</span>
            <span className="df-mono text-right" style={{ width: 112, fontSize: 21, fontWeight: 500, letterSpacing: "-.014em" }}>
              {pay ? pay.net : inr(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="df-card" style={{ padding: 22 }}>
          <p className="df-kicker" style={{ margin: "0 0 16px" }}>
            Payslips
          </p>
          <div className="flex flex-col gap-[2px]">
            {PAYSLIPS.map((p) => (
              <div key={p.id} className="df-row flex items-center gap-3" style={{ padding: "11px 10px", borderRadius: 11, borderTop: "none" }}>
                <span className="grid flex-none place-items-center" style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(16,19,23,.05)", color: "var(--df-ink4)" }}>
                  <SlipIcon size={14} />
                </span>
                <span className="min-w-0 flex-1" style={{ font: "450 13.5px/1.3 var(--font-geist-sans)" }}>
                  {p.month}
                </span>
                <span className="df-mono flex-none" style={{ fontSize: 12.5, color: "var(--df-ink3)" }}>
                  {p.net}
                </span>
                <button
                  type="button"
                  onClick={() => s.toast(p.month + " payslip queued for download")}
                  style={{ border: "none", background: "transparent", font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-indigo)", cursor: "pointer" }}
                >
                  PDF
                </button>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", font: "400 12.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
            Slip generation is queued for the next release; HR can export the register today.
          </p>
        </div>

        <div className="df-glass" style={{ padding: 20, borderRadius: 20 }}>
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center" style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(60,88,216,.14)", color: "var(--df-indigo)" }}>
              <InfoIcon size={13} />
            </span>
            <span style={{ font: "600 14px/1.3 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Only HR can change this</span>
          </div>
          <p style={{ margin: "9px 0 0", font: "400 13px/1.55 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
            Employees have read-only payroll access. Raise a query with People if a component looks wrong.
          </p>
        </div>
      </div>
    </div>
  );
}
