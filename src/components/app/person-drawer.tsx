"use client";

// right-hand slide-over for one employee. resume, private info, salary.
import { useRouter } from "next/navigation";
import { Avatar, StatusPill, Tile } from "@/components/app/bits";
import { XIcon } from "@/components/app/icons";
import { useDayflow, type ProfileTab } from "@/components/app/store";
import { payrollFor } from "@/lib/dayflow";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "resume", label: "Resume" },
  { key: "private", label: "Private info" },
  { key: "salary", label: "Salary info" },
];

export function PersonDrawer() {
  const s = useDayflow();
  const router = useRouter();
  const person = s.people.find((p) => p.id === s.selected);
  if (!person) return null;

  const pay = payrollFor(person.wage);

  return (
    <div className="fixed inset-0" style={{ zIndex: 70 }}>
      <div
        onClick={() => s.select(null)}
        className="absolute inset-0"
        style={{ background: "rgba(16,19,23,.22)", animation: "dfRise 200ms ease-out" }}
      />
      <div
        className="df-float absolute flex flex-col"
        style={{
          top: 14,
          right: 14,
          bottom: 14,
          width: "min(460px, calc(100vw - 28px))",
          boxSizing: "border-box",
          borderRadius: 16,
          overflow: "hidden",
          animation: "dfSlide 300ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        <div className="flex-none" style={{ padding: "22px 22px 16px" }}>
          <div className="flex items-start gap-3.5">
            <Avatar name={person.name} size={52} />
            <span className="min-w-0 flex-1">
              <span style={{ display: "block", font: "600 19px/1.24 var(--font-geist-sans)", letterSpacing: "-.016em" }}>
                {person.name}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 4,
                  font: "400 13.5px/1.4 var(--font-geist-sans)",
                  color: "var(--df-ink3)",
                }}
              >
                {person.role} · {person.dept}
              </span>
              <span className="mt-[11px] flex flex-wrap items-center gap-2">
                <StatusPill status={person.st} />
                <span
                  className="df-mono"
                  style={{
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "rgba(16,19,23,.05)",
                    fontSize: 11.5,
                    color: "var(--df-ink3)",
                  }}
                >
                  {person.empId}
                </span>
              </span>
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => s.select(null)}
              className="grid flex-none place-items-center"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                border: "1px solid rgba(16,19,23,.1)",
                background: "rgba(16,19,23,.04)",
                cursor: "pointer",
                color: "var(--df-ink2)",
              }}
            >
              <XIcon size={13} />
            </button>
          </div>

          <div className="df-seg mt-[18px] flex" style={{ gap: 3 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className="df-seg-btn"
                style={{ flex: 1, padding: "9px 10px" }}
                data-on={s.tab === t.key}
                onClick={() => s.setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto" style={{ padding: "0 22px 22px" }}>
          {s.tab === "private" ? (
            <div className="grid grid-cols-2 gap-2.5">
              <Tile label="Mobile">
                <span className="df-mono">+91 98450 11234</span>
              </Tile>
              <Tile label="Personal email">personal@fastmail.com</Tile>
              <Tile label="Reports to">{person.mgr}</Tile>
              <Tile label="Location">{person.loc}</Tile>
              <div className="col-span-2">
                <Tile label="Residing address">
                  12B Ashwin Residency, Indiranagar, Bengaluru 560038
                </Tile>
              </div>
              <div className="col-span-2">
                <Tile label="Bank details">
                  <span className="flex flex-wrap gap-3.5">
                    <span>HDFC Bank</span>
                    <span className="df-mono" style={{ color: "var(--df-ink3)" }}>
                      •••• 4471
                    </span>
                    <span className="df-mono" style={{ color: "var(--df-ink3)" }}>
                      HDFC0001284
                    </span>
                  </span>
                  <span className="mt-[9px] flex flex-wrap gap-3.5">
                    <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink5)" }}>
                      PAN ABCPR•••4F
                    </span>
                    <span className="df-mono" style={{ fontSize: 12.5, color: "var(--df-ink5)" }}>
                      UAN 101234567890
                    </span>
                  </span>
                </Tile>
              </div>
            </div>
          ) : null}

          {s.tab === "salary" ? (
            <div>
              <div
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "rgba(16,19,23,.04)",
                  border: "1px solid rgba(16,19,23,.12)",
                }}
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="df-kicker" style={{ fontSize: 10.5, color: "var(--df-ink3)" }}>
                    Monthly wage
                  </span>
                  <span
                    className="df-mono ml-auto"
                    style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-.014em" }}
                  >
                    {pay.month}
                  </span>
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    font: "400 12.5px/1.5 var(--font-geist-sans)",
                    color: "var(--df-ink3)",
                  }}
                >
                  Visible to Admin and HR only. Employees see a read-only copy of their own structure.
                </p>
              </div>

              <div
                className="mt-3"
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid rgba(16,19,23,.1)",
                }}
              >
                {pay.comps.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3"
                    style={{ padding: "12px 16px", borderBottom: "1px solid rgba(16,19,23,.05)" }}
                  >
                    <span className="min-w-0 flex-1" style={{ font: "450 13px/1.3 var(--font-geist-sans)" }}>
                      {c.label}
                    </span>
                    <span className="df-mono flex-none" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
                      {c.value}
                    </span>
                    <span className="df-mono flex-none" style={{ fontSize: 13, fontWeight: 500 }}>
                      {c.amount}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3" style={{ padding: "14px 16px" }}>
                  <span style={{ flex: 1, font: "600 13.5px/1 var(--font-geist-sans)", letterSpacing: "-.006em" }}>
                    Net take-home
                  </span>
                  <span className="df-mono flex-none" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-.01em" }}>
                    {pay.net}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  s.select(null);
                  router.push("/pay");
                }}
                className="df-btn"
                style={{
                  width: "100%",
                  margin: "12px 0 0",
                  borderColor: "rgba(16,19,23,.14)",
                  background: "#fff",
                  color: "var(--df-ink)",
                }}
              >
                Open in payroll
              </button>
            </div>
          ) : null}

          {s.tab === "resume" || s.tab === "settings" ? (
            <div>
              <div
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "rgba(16,19,23,.03)",
                  border: "1px solid rgba(16,19,23,.07)",
                }}
              >
                <p className="df-kicker" style={{ margin: "0 0 8px", fontSize: 10.5, letterSpacing: ".07em" }}>
                  About
                </p>
                <p style={{ margin: 0, font: "400 13.5px/1.6 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
                  Works out of {person.loc}, reporting to {person.mgr}. Joined {person.joined}.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Tile label="Employee ID">
                  <span className="df-mono">{person.empId}</span>
                </Tile>
                <Tile label="Location">{person.loc}</Tile>
                <Tile label="Manager">{person.mgr}</Tile>
                <Tile label="Joined">{person.joined}</Tile>
              </div>

              <div
                className="mt-3"
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "rgba(16,19,23,.03)",
                  border: "1px solid rgba(16,19,23,.07)",
                }}
              >
                <p className="df-kicker" style={{ margin: "0 0 11px", fontSize: 10.5, letterSpacing: ".07em" }}>
                  Today
                </p>
                <div className="flex gap-2.5">
                  {[
                    { v: person.in, c: "Check in" },
                    { v: person.out, c: "Check out" },
                    { v: person.hrs, c: "Work hours" },
                    { v: person.extra, c: "Extra", color: "var(--df-green-lo)" },
                  ].map((cell) => (
                    <div key={cell.c} className="flex-1">
                      <div className="df-mono" style={{ fontSize: 16, fontWeight: 500, color: cell.color }}>
                        {cell.v}
                      </div>
                      <div
                        style={{
                          margin: "6px 0 0",
                          font: "450 11px/1.3 var(--font-geist-sans)",
                          color: "var(--df-ink5)",
                        }}
                      >
                        {cell.c}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
