"use client";

// HR decision queue. approve or reject, then it drops into Decided.
import { Avatar } from "@/components/app/bits";
import { CheckIcon, DocIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { tone } from "@/lib/dayflow";

export function Approvals() {
  const s = useDayflow();
  const pending = s.requests.filter((r) => r.status === "Pending");
  const decided = s.requests.filter((r) => r.status !== "Pending");

  return (
    <div className="flex flex-col gap-4">
      <div className="df-glass-thin flex flex-wrap items-center gap-3" style={{ padding: "16px 20px", borderRadius: 18 }}>
        <div className="min-w-0 flex-1">
          <div style={{ font: "600 15px/1.3 var(--font-geist-sans)", letterSpacing: "-.008em" }}>
            {pending.length} requests waiting on you
          </div>
          <div style={{ margin: "4px 0 0", font: "400 12.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
            Decisions apply to the employee’s record and balance immediately.
          </div>
        </div>
        <span className="df-pill" style={{ padding: "7px 13px", background: "rgba(60,88,216,.1)", border: "1px solid rgba(60,88,216,.2)", color: "var(--df-indigo-lo)" }}>
          Paid
        </span>
        <span className="df-pill" style={{ padding: "7px 13px", background: "rgba(110,86,207,.1)", border: "1px solid rgba(110,86,207,.2)", color: "var(--df-violet-lo)" }}>
          Sick
        </span>
        <span className="df-pill" style={{ padding: "7px 13px", background: "rgba(16,19,23,.05)", border: "1px solid rgba(16,19,23,.09)", color: "var(--df-ink3)" }}>
          Unpaid
        </span>
      </div>

      {pending.map((r) => {
        const st = tone(r.status);
        return (
          <div key={r.id} className="df-card flex flex-wrap items-center gap-4" style={{ padding: 20 }}>
            <Avatar name={r.who} size={42} />
            <span className="min-w-[220px] flex-1">
              <span className="flex flex-wrap items-center gap-2.5">
                <span style={{ font: "600 14.5px/1.3 var(--font-geist-sans)", letterSpacing: "-.008em" }}>{r.who}</span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: st.bg,
                    border: `1px solid ${st.bd}`,
                    font: "500 11.5px/1 var(--font-geist-sans)",
                    color: st.fg,
                  }}
                >
                  {r.status}
                </span>
                <span className="df-mono" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
                  {r.id}
                </span>
              </span>
              <span style={{ display: "block", marginTop: 7, font: "450 13px/1.4 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
                {r.type} · {r.range} · {r.days} day(s)
              </span>
              <span style={{ display: "block", marginTop: 4, font: "400 12.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                {r.note}
              </span>
              {r.attach ? (
                <span
                  className="df-mono mt-2.5 inline-flex items-center gap-2"
                  style={{
                    padding: "6px 11px",
                    borderRadius: 9,
                    background: "rgba(110,86,207,.08)",
                    border: "1px solid rgba(110,86,207,.2)",
                    fontSize: 11.5,
                    color: "var(--df-violet-lo)",
                  }}
                >
                  <DocIcon size={12} />
                  {r.attach}
                </span>
              ) : null}
            </span>
            <span className="flex flex-none gap-[9px]">
              <button type="button" onClick={() => s.decide(r.id, "Rejected", r.who)} className="df-btn df-btn-bad" style={{ padding: "11px 18px", borderRadius: 12 }}>
                Reject
              </button>
              <button type="button" onClick={() => s.decide(r.id, "Approved", r.who)} className="df-btn df-btn-good" style={{ padding: "11px 18px", borderRadius: 12 }}>
                <CheckIcon size={14} />
                Approve
              </button>
            </span>
          </div>
        );
      })}

      {pending.length === 0 ? (
        <div style={{ padding: "44px 20px", textAlign: "center", borderRadius: 20, background: "#fff", border: "1px dashed rgba(16,19,23,.16)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(15,138,95,.1)", margin: "0 auto 14px" }} />
          <div style={{ font: "600 15px/1.3 var(--font-geist-sans)", letterSpacing: "-.008em" }}>Nothing left to decide</div>
          <p style={{ margin: "6px 0 0", font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
            Switch to Employee and file a request to see this queue fill up again.
          </p>
        </div>
      ) : null}

      <div className="df-card overflow-hidden">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
          <h3 className="df-h3">Decided</h3>
        </div>
        {decided.map((r) => {
          const st = tone(r.status);
          return (
            <div key={r.id} className="df-row flex items-center gap-3.5" style={{ padding: "14px 20px" }}>
              <Avatar name={r.who} size={30} />
              <span className="min-w-0 flex-1">
                <span style={{ display: "block", font: "450 13.5px/1.3 var(--font-geist-sans)" }}>
                  {r.who} · {r.type}
                </span>
                <span style={{ display: "block", marginTop: 3, font: "400 12px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                  {r.note}
                </span>
              </span>
              <span className="df-mono hidden flex-none sm:inline" style={{ fontSize: 12, color: "var(--df-ink5)" }}>
                {r.range}
              </span>
              <span className="df-pill flex-none" style={{ background: st.bg, border: `1px solid ${st.bd}`, color: st.fg, padding: "6px 12px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                {r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
