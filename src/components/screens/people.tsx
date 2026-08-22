"use client";

// directory grid, live from the db. search filters, card click opens the drawer.
// "new employee" opens the hr provisioning form — the only account creation path.
import { useState } from "react";
import { StatusDot } from "@/components/app/bits";
import { PlusIcon, SearchIcon, XIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { avatarOf } from "@/lib/dayflow";

const KEY = [
  { label: "In office", status: "Present" },
  { label: "Half-day", status: "Half-day" },
  { label: "On leave", status: "Leave" },
  { label: "Absent", status: "Absent" },
];

export function People() {
  const s = useDayflow();
  const q = s.search.trim().toLowerCase();
  const shown = s.people.filter(
    (p) => !q || `${p.name} ${p.dept} ${p.role} ${p.empId}`.toLowerCase().includes(q),
  );
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="flex min-w-[240px] flex-1 items-center gap-2.5"
          style={{ padding: "12px 14px", borderRadius: 14, background: "#fff", border: "1px solid rgba(16,19,23,.1)", boxShadow: "0 1px 2px rgba(16,19,23,.04)" }}
        >
          <SearchIcon size={15} style={{ color: "var(--df-ink5)" }} />
          <input
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder="Search by name, department, role or employee ID"
            className="min-w-0 flex-1 bg-transparent outline-none"
            style={{ font: "400 13.5px/1.2 var(--font-geist-sans)", border: "none" }}
          />
          <span className="df-mono" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
            {shown.length} shown
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="df-btn df-btn-primary flex-none"
          style={{ padding: "13px 20px", borderRadius: 14, fontSize: 14 }}
        >
          <PlusIcon size={15} />
          New employee
        </button>
      </div>

      {addOpen ? <AddEmployeeModal onClose={() => setAddOpen(false)} /> : null}

      <div className="df-glass-thin flex flex-wrap items-center gap-4" style={{ padding: "12px 16px", borderRadius: 14 }}>
        <span className="df-kicker" style={{ fontSize: 11 }}>
          Status key
        </span>
        {KEY.map((k) => (
          <span key={k.label} className="inline-flex items-center gap-[7px]" style={{ font: "450 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
            <StatusDot status={k.status} />
            {k.label}
          </span>
        ))}
        <span className="ml-auto" style={{ font: "400 12px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
          Cards open in view-only mode
        </span>
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))" }}>
        {shown.map((p) => {
          const a = avatarOf(p.name);
          return (
            <div
              key={p.id}
              onClick={() => {
                s.setTab("resume");
                s.select(p.id);
              }}
              className="df-card relative cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{ padding: 18, borderRadius: 18 }}
            >
              <span style={{ position: "absolute", top: 16, right: 16 }}>
                <StatusDot status={p.st} size={9} />
              </span>
              <div
                className="grid place-items-center rounded-full"
                style={{ width: 48, height: 48, background: a.tint, color: a.ink, font: "500 17px/1 var(--font-geist-sans)" }}
              >
                {a.init}
              </div>
              <div style={{ margin: "15px 0 0", font: "600 14.5px/1.3 var(--font-geist-sans)", letterSpacing: "-.008em" }}>
                {p.name}
              </div>
              <div style={{ margin: "4px 0 0", font: "400 12.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                {p.role}
              </div>
              <div className="mt-[15px] flex items-center gap-2">
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "rgba(16,19,23,.05)",
                    font: "450 11.5px/1 var(--font-geist-sans)",
                    color: "var(--df-ink3)",
                  }}
                >
                  {p.dept}
                </span>
                <span className="df-mono" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
                  {p.in}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Created = { name: string; empId: string; tempPassword: string };

// hr creates an employee. server mints the id + temp password; the password
// shows once, right here, then exists only as a bcrypt hash.
function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const s = useDayflow();
  const [company, setCompany] = useState("Odoo India");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [role, setRole] = useState<"employee" | "hr_admin">("employee");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, firstName, lastName, email, phone, joiningDate, role }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not create the employee");
        return;
      }
      setCreated({ name: d.employee.name, empId: d.employee.empId, tempPassword: d.tempPassword });
      await s.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0" style={{ zIndex: 65 }}>
      <div
        onClick={onClose}
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
          width: "min(560px, calc(100vw - 40px))",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          padding: 26,
          boxSizing: "border-box",
          borderRadius: 24,
          animation: "dfPop 240ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        {created ? (
          <div>
            <h3 style={{ margin: 0, font: "600 19px/1.24 var(--font-geist-sans)", letterSpacing: "-.016em" }}>
              {created.name} is in
            </h3>
            <p style={{ margin: "6px 0 0", font: "400 13.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
              Share these once. The password is not stored anywhere in plain text.
            </p>

            <div className="mt-[18px] flex flex-col gap-2.5">
              <div className="df-row flex items-center gap-3" style={{ padding: "13px 16px", borderRadius: 13, borderTop: "none" }}>
                <span className="min-w-0 flex-1" style={{ font: "450 13px/1.3 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
                  Employee ID
                </span>
                <span className="df-mono" style={{ fontSize: 14, fontWeight: 500 }}>{created.empId}</span>
              </div>
              <div className="df-row flex items-center gap-3" style={{ padding: "13px 16px", borderRadius: 13, borderTop: "none" }}>
                <span className="min-w-0 flex-1" style={{ font: "450 13px/1.3 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
                  Temporary password
                </span>
                <span className="df-mono" style={{ fontSize: 14, fontWeight: 500 }}>{created.tempPassword}</span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(created.empId + " / " + created.tempPassword);
                    s.toast("Credentials copied");
                  }}
                  className="df-btn"
                  style={{ padding: "7px 12px", borderRadius: 9, fontSize: 12, borderColor: "rgba(16,19,23,.12)", background: "rgba(255,255,255,.8)", color: "var(--df-ink2)" }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div
              className="mt-3 flex items-center gap-2.5"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(180,114,10,.07)",
                border: "1px solid rgba(180,114,10,.2)",
                font: "450 12.5px/1.5 var(--font-geist-sans)",
                color: "var(--df-amber-lo)",
              }}
            >
              The employee must change this password on first login.
            </div>

            <button type="button" onClick={onClose} className="df-btn df-btn-primary" style={{ width: "100%", marginTop: 18, padding: "12px 16px", fontSize: 14 }}>
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3.5">
              <div className="flex-1">
                <h3 style={{ margin: 0, font: "600 19px/1.24 var(--font-geist-sans)", letterSpacing: "-.016em" }}>
                  Add employee
                </h3>
                <p style={{ margin: "6px 0 0", font: "400 13.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
                  Login ID and temporary password are generated automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid flex-none place-items-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  border: "1px solid rgba(16,19,23,.1)",
                  background: "rgba(255,255,255,.7)",
                  cursor: "pointer",
                  color: "var(--df-ink2)",
                }}
              >
                <XIcon size={13} />
              </button>
            </div>

            <div className="mt-[18px] grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>Company name</label>
                <input className="df-input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>Joining date</label>
                <input className="df-input" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>First name</label>
                <input className="df-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>Last name</label>
                <input className="df-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>Email</label>
                <input className="df-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>Phone</label>
                <input className="df-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <p className="df-kicker" style={{ margin: "18px 0 9px" }}>Role</p>
            <div className="df-seg flex">
              <button type="button" className="df-seg-btn" style={{ flex: 1, padding: 10 }} data-on={role === "employee"} onClick={() => setRole("employee")}>
                Employee
              </button>
              <button type="button" className="df-seg-btn" style={{ flex: 1, padding: 10 }} data-on={role === "hr_admin"} onClick={() => setRole("hr_admin")}>
                HR Admin
              </button>
            </div>

            {error ? (
              <div
                style={{
                  margin: "16px 0 0",
                  padding: "11px 13px",
                  borderRadius: 12,
                  background: "rgba(198,66,60,.08)",
                  border: "1px solid rgba(198,66,60,.2)",
                  font: "450 13px/1.4 var(--font-geist-sans)",
                  color: "var(--df-red-lo)",
                }}
              >
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex items-center gap-2.5">
              <button type="button" disabled={busy} onClick={() => void submit()} className="df-btn df-btn-primary" style={{ flex: 1, padding: "13px 18px", fontSize: 14, opacity: busy ? 0.7 : 1 }}>
                {busy ? "Creating…" : "Create employee"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="df-btn"
                style={{ flex: "none", borderColor: "rgba(16,19,23,.12)", background: "rgba(255,255,255,.7)", color: "var(--df-ink2)", padding: "13px 18px", fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
