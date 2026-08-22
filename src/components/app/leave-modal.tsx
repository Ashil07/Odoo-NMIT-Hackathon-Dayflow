"use client";

// request time off. type, dates, remarks, and a nag for a certificate on sick.
import { DocIcon, XIcon } from "@/components/app/icons";
import { useDayflow, type LeaveType } from "@/components/app/store";
import { ENTITLEMENTS, isBalanceType } from "@/lib/entitlements";

const TYPE_SKIN: Record<LeaveType, { on: string; bd: string }> = {
  Paid: { on: "rgba(16,19,23,.06)", bd: "#101317" },
  Sick: { on: "rgba(16,19,23,.06)", bd: "#101317" },
  Unpaid: { on: "rgba(16,19,23,.06)", bd: "#101317" },
};

export function LeaveModal() {
  const s = useDayflow();
  if (!s.leaveOpen) return null;

  // live balance for whatever type is selected. unpaid has no cap
  const used = s.requests
    .filter((r) => r.status === "Approved" && r.type.startsWith(s.leaveType))
    .reduce((sum, r) => sum + r.days, 0);
  const cap = isBalanceType(s.leaveType) ? ENTITLEMENTS[s.leaveType] : null;
  const left = cap === null ? null : Math.max(0, cap - used);
  const balanceLine =
    left === null
      ? "Unpaid leave has no cap, but those days are cut from your pay."
      : left === 0
        ? `You are out of ${s.leaveType.toLowerCase()} leave, kindly select another option.`
        : `You have ${left} of ${cap} ${s.leaveType.toLowerCase()} days left.`;

  return (
    <div className="fixed inset-0" style={{ zIndex: 60 }}>
      <div
        onClick={s.closeLeave}
        className="absolute inset-0"
        style={{
          background: "rgba(16,19,23,.28)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          animation: "dfRise 200ms ease-out",
        }}
      />
      <div
        className="df-float absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(520px, calc(100vw - 40px))",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          padding: 26,
          boxSizing: "border-box",
          borderRadius: 16,
          animation: "dfPop 240ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex-1">
            <h3 style={{ margin: 0, font: "600 19px/1.24 var(--font-geist-sans)", letterSpacing: "-.016em" }}>
              Request time off
            </h3>
            <p style={{ margin: "6px 0 0", font: "400 13.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
              Goes to {s.me?.profile.manager ?? "your manager"} for approval. {balanceLine}
            </p>
          </div>
          <button
            type="button"
            onClick={s.closeLeave}
            aria-label="Close"
            className="grid flex-none place-items-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(16,19,23,.1)",
              background: "rgba(16,19,23,.04)",
              cursor: "pointer",
              color: "var(--df-ink2)",
            }}
          >
            <XIcon size={13} />
          </button>
        </div>

        <p className="df-kicker" style={{ margin: "22px 0 9px" }}>
          Type
        </p>
        <div className="flex gap-2">
          {(["Paid", "Sick", "Unpaid"] as LeaveType[]).map((t) => {
            const on = s.leaveType === t;
            const skin = TYPE_SKIN[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => s.setLeaveType(t)}
                style={{
                  flex: 1,
                  appearance: "none",
                  cursor: "pointer",
                  padding: "12px 10px",
                  borderRadius: 12,
                  font: "500 13px/1 var(--font-geist-sans)",
                  color: "var(--df-ink)",
                  background: on ? skin.on : "#fff",
                  border: `1px solid ${on ? skin.bd : "rgba(16,19,23,.12)"}`,
                  transition: "background 140ms ease, border-color 140ms ease",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="mt-[18px] flex gap-3">
          <div className="flex-1">
            <label className="df-label" style={{ margin: "0 0 7px" }}>
              From
            </label>
            <input
              className="df-input"
              type="date"
              value={s.from}
              onChange={(e) => s.setFrom(e.target.value)}
              style={{ background: "#fff" }}
            />
          </div>
          <div className="flex-1">
            <label className="df-label" style={{ margin: "0 0 7px" }}>
              To
            </label>
            <input
              className="df-input"
              type="date"
              value={s.to}
              onChange={(e) => s.setTo(e.target.value)}
              style={{ background: "#fff" }}
            />
          </div>
          <div style={{ flex: "none", width: 88 }}>
            <label className="df-label" style={{ margin: "0 0 7px", color: "var(--df-ink5)" }}>
              Days
            </label>
            <div
              className="df-mono"
              style={{
                padding: "11px 13px",
                borderRadius: 11,
                background: "rgba(16,19,23,.05)",
                border: "1px solid rgba(16,19,23,.06)",
                font: "500 13.5px/1.2 var(--font-geist-mono)",
                textAlign: "center",
              }}
            >
              {s.leaveDays}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="df-label" style={{ margin: "0 0 7px" }}>
            Remarks
          </label>
          <textarea
            className="df-input"
            rows={2}
            value={s.remarks}
            onChange={(e) => s.setRemarks(e.target.value)}
            placeholder="Context helps your manager decide faster"
            style={{ background: "#fff", lineHeight: 1.5, resize: "none" }}
          />
        </div>

        {s.leaveType === "Sick" ? (
          <div
            className="mt-4 flex items-center gap-3"
            style={{
              padding: "13px 14px",
              borderRadius: 12,
              border: "1px dashed rgba(180,114,10,.4)",
              background: "rgba(180,114,10,.06)",
            }}
          >
            <span
              className="grid flex-none place-items-center"
              style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(180,114,10,.14)" }}
            >
              <DocIcon size={14} style={{ color: "var(--df-amber-lo)" }} />
            </span>
            <span className="min-w-0 flex-1">
              <span style={{ display: "block", font: "500 12.5px/1.3 var(--font-geist-sans)" }}>Attachment</span>
              <span
                style={{
                  display: "block",
                  marginTop: 2,
                  font: "400 11.5px/1.4 var(--font-geist-sans)",
                  color: "var(--df-amber-lo)",
                }}
              >
                Medical certificate required beyond two days
              </span>
            </span>
            {s.attach ? (
              <span
                className="df-mono flex-none"
                style={{
                  padding: "6px 11px",
                  borderRadius: 999,
                  background: "rgba(180,114,10,.14)",
                  fontSize: 11.5,
                  color: "var(--df-amber-lo)",
                }}
              >
                certificate.pdf
              </span>
            ) : null}
            <button
              type="button"
              onClick={s.toggleAttach}
              className="df-btn"
              style={{
                flex: "none",
                borderColor: "rgba(16,19,23,.12)",
                background: "#fff",
                color: "var(--df-ink2)",
                padding: "8px 13px",
                borderRadius: 8,
                fontSize: 12.5,
              }}
            >
              {s.attach ? "Remove" : "Attach"}
            </button>
          </div>
        ) : null}

        <div className="mt-[22px] flex items-center gap-2.5">
          <button type="button" onClick={s.submitLeave} className="df-btn df-btn-primary" style={{ flex: 1, padding: "13px 18px", fontSize: 14 }}>
            Submit
          </button>
          <button
            type="button"
            onClick={s.closeLeave}
            className="df-btn"
            style={{
              flex: "none",
              borderColor: "rgba(16,19,23,.12)",
              background: "#fff",
              color: "var(--df-ink2)",
              padding: "13px 18px",
              fontSize: 14,
            }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
