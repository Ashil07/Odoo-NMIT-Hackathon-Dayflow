"use client";

// HR landing: headcount pulse, live check-ins, approval queue, dept bars.
import { useRouter } from "next/navigation";
import { Avatar, StatusDot, StatusPill } from "@/components/app/bits";
import { CheckIcon, XIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";

export function AdminDashboard() {
  const s = useDayflow();
  const router = useRouter();

  const pending = s.requests.filter((r) => r.status === "Pending");
  const count = (st: string) => s.people.filter((p) => p.st === st).length;

  const tiles = [
    { dot: "#0F8A5F", n: count("Present"), c: "Present in office", status: "Present" },
    { dot: "#B4720A", n: count("Half-day"), c: "Half-day", status: "Half-day" },
    { dot: "#8A9099", n: count("Leave"), c: "On approved leave", status: "Leave" },
    { dot: "#C6423C", n: count("Absent"), c: "Absent, no request", status: "Absent" },
  ];

  // dept bars from the live register
  const deptMap = new Map<string, { of: number; in: number }>();
  for (const p of s.people) {
    const d = deptMap.get(p.dept) ?? { of: 0, in: 0 };
    d.of += 1;
    if (p.st === "Present") d.in += 1;
    deptMap.set(p.dept, d);
  }
  const DEPTS = [...deptMap.entries()].map(([label, v]) => ({
    label,
    of: `${v.in} / ${v.of}`,
    pct: v.of ? Math.round((v.in / v.of) * 100) : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        {tiles.map((t) => (
          <div key={t.c} className="df-card" style={{ padding: 18 }}>
            <div className="flex items-center gap-2">
              <StatusDot status={t.status} size={8} />
              <span className="df-mono" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: "-.016em" }}>
                {t.n}
              </span>
            </div>
            <div style={{ margin: "9px 0 0", font: "450 12px/1.3 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
              {t.c}
            </div>
          </div>
        ))}
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            background: "rgba(180,114,10,.07)",
            border: "1px solid rgba(180,114,10,.22)",
            boxShadow: "0 1px 2px rgba(16,19,23,.04)",
          }}
        >
          <div className="df-mono" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: "-.016em", color: "var(--df-amber-lo)" }}>
            {pending.length}
          </div>
          <div style={{ margin: "9px 0 0", font: "450 12px/1.3 var(--font-geist-sans)", color: "var(--df-amber-lo)" }}>
            Waiting on you
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))" }}>
        {/* check-ins */}
        <div className="df-card overflow-hidden" style={{ padding: 0 }}>
          <div className="flex items-center gap-3" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
            <h3 className="df-h3">Check-ins today</h3>
            <button
              type="button"
              onClick={() => router.push("/attendance")}
              className="ml-auto"
              style={{ border: "none", background: "transparent", font: "500 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink2)", cursor: "pointer" }}
            >
              Full attendance
            </button>
          </div>
          {s.people.map((p) => (
            <div
              key={p.id}
              className="df-row grid items-center gap-3"
              style={{ gridTemplateColumns: "1.6fr .7fr .7fr 1fr", padding: "12px 20px" }}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Avatar name={p.name} size={26} />
                <span className="truncate" style={{ font: "450 13px/1.3 var(--font-geist-sans)" }}>
                  {p.name}
                </span>
              </span>
              <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink2)" }}>
                {p.in}
              </span>
              <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink2)" }}>
                {p.hrs}
              </span>
              <StatusPill status={p.st} style={{ justifySelf: "start" }} />
            </div>
          ))}
          {s.people.length === 0 ? (
            <div style={{ padding: "26px 20px", font: "400 13px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
              Register loads in a moment.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          {/* queue */}
          <div className="df-card overflow-hidden">
            <div className="flex items-center gap-3" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,19,23,.07)" }}>
              <h3 className="df-h3">Waiting on you</h3>
              <button
                type="button"
                onClick={() => router.push("/time-off")}
                className="ml-auto"
                style={{ border: "none", background: "transparent", font: "500 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink2)", cursor: "pointer" }}
              >
                Open approvals
              </button>
            </div>

            {pending.map((r) => (
              <div key={r.id} className="flex items-center gap-3" style={{ padding: "13px 20px", borderTop: "1px solid rgba(16,19,23,.06)" }}>
                <Avatar name={r.who} size={28} />
                <span className="min-w-0 flex-1">
                  <span style={{ display: "block", font: "500 13px/1.3 var(--font-geist-sans)", letterSpacing: "-.004em" }}>
                    {r.who}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: 2,
                      font: "400 11.5px/1.3 var(--font-geist-sans)",
                      color: "var(--df-ink4)",
                    }}
                  >
                    {r.type} · {r.range}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Approve"
                  onClick={() => void s.decide(r.id, "Approved")}
                  className="grid flex-none place-items-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: "1px solid rgba(15,138,95,.3)",
                    background: "rgba(15,138,95,.1)",
                    color: "var(--df-green-lo)",
                    cursor: "pointer",
                  }}
                >
                  <CheckIcon size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Reject"
                  onClick={() => void s.decide(r.id, "Rejected")}
                  className="grid flex-none place-items-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: "1px solid rgba(198,66,60,.28)",
                    background: "rgba(198,66,60,.08)",
                    color: "var(--df-red-lo)",
                    cursor: "pointer",
                  }}
                >
                  <XIcon size={13} />
                </button>
              </div>
            ))}

            {pending.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: 9, background: "rgba(15,138,95,.1)", margin: "0 auto 12px" }} />
                <div style={{ font: "600 14px/1.3 var(--font-geist-sans)", letterSpacing: "-.006em" }}>Queue is clear</div>
                <p style={{ margin: "5px 0 0", font: "400 12.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                  Every decision lands in the employee&apos;s record immediately.
                </p>
              </div>
            ) : null}
          </div>

          {/* dept bars */}
          <div className="df-card" style={{ padding: 20 }}>
            <p className="df-kicker" style={{ margin: "0 0 15px" }}>
              Presence by department
            </p>
            <div className="flex flex-col gap-3">
              {DEPTS.map((d) => (
                <div key={d.label}>
                  <div
                    className="mb-[7px] flex justify-between"
                    style={{ font: "450 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink2)" }}
                  >
                    <span>{d.label}</span>
                    <span className="df-mono" style={{ color: "var(--df-ink5)" }}>
                      {d.of}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: "rgba(16,19,23,.07)", overflow: "hidden" }}>
                    <div style={{ width: `${d.pct}%`, height: "100%", background: "var(--df-ink)" }} />
                  </div>
                </div>
              ))}
              {DEPTS.length === 0 ? (
                <p style={{ margin: 0, font: "400 12.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                  No departments yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
