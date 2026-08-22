"use client";

// my leave: three balance dials plus every request I ever filed.

import { PlusIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { TONES, tone } from "@/lib/dayflow";

// leave type drives the day-count chip colour
function typeTone(type: string) {
  if (type.startsWith("Sick")) return TONES.violet;
  if (type.startsWith("Unpaid")) return TONES.grey;
  return TONES.indigo;
}

function Dial({ pct, value, color }: { pct: number; value: string; color: string }) {
  return (
    <div
      className="grid place-items-center"
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: `conic-gradient(${color} 0 ${pct}%, rgba(16,19,23,.08) ${pct}% 100%)`,
      }}
    >
      <div className="df-mono grid place-items-center" style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", fontSize: 13, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

export function TimeOff() {
  const s = useDayflow();
  const mine = s.requests.filter((r) => r.who === "Aarav Rao");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="df-card min-w-[190px] flex-1" style={{ padding: 20, borderRadius: 18 }}>
          <div className="flex items-center gap-3.5">
            <Dial pct={75} value="18" color="#3C58D8" />
            <div>
              <div style={{ font: "600 14.5px/1.2 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Paid time off</div>
              <div className="df-mono" style={{ margin: "5px 0 0", fontSize: 12, color: "var(--df-ink5)" }}>
                18 of 24 days available
              </div>
            </div>
          </div>
        </div>

        <div className="df-card min-w-[190px] flex-1" style={{ padding: 20, borderRadius: 18 }}>
          <div className="flex items-center gap-3.5">
            <Dial pct={57} value="4" color="#6E56CF" />
            <div>
              <div style={{ font: "600 14.5px/1.2 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Sick leave</div>
              <div className="df-mono" style={{ margin: "5px 0 0", fontSize: 12, color: "var(--df-ink5)" }}>
                4 of 7 days available
              </div>
            </div>
          </div>
        </div>

        <div className="df-card min-w-[190px] flex-1" style={{ padding: 20, borderRadius: 18 }}>
          <div className="flex items-center gap-3.5">
            <div
              className="df-mono grid place-items-center"
              style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,19,23,.06)", fontSize: 13, fontWeight: 500, color: "var(--df-ink3)" }}
            >
              0
            </div>
            <div>
              <div style={{ font: "600 14.5px/1.2 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Unpaid</div>
              <div className="df-mono" style={{ margin: "5px 0 0", fontSize: 12, color: "var(--df-ink5)" }}>
                Manager approval
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={s.openLeave} className="df-btn df-btn-primary flex-none" style={{ padding: "0 24px", borderRadius: 18, fontSize: 14.5 }}>
          <PlusIcon size={16} />
          Apply for leave
        </button>
      </div>

      <div className="df-card overflow-hidden">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
          <h3 className="df-h3">My requests</h3>
        </div>

        {mine.map((r) => {
          const ty = typeTone(r.type);
          const st = tone(r.status);
          return (
            <div key={r.id} className="df-row flex items-center gap-4" style={{ padding: "16px 20px" }}>
              <span
                className="df-mono grid flex-none place-items-center"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500,
                  background: ty.bg,
                  border: `1px solid ${ty.bd}`,
                  color: ty.fg,
                }}
              >
                {r.days}d
              </span>
              <span className="min-w-0 flex-1">
                <span style={{ display: "block", font: "500 14px/1.3 var(--font-geist-sans)", letterSpacing: "-.006em" }}>
                  {r.type} · {r.range}
                </span>
                <span
                  style={{ display: "block", marginTop: 3, font: "400 12.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}
                >
                  {r.note}
                </span>
              </span>
              <span className="df-mono hidden flex-none sm:inline" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
                {r.id}
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
