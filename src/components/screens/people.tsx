"use client";

// directory grid. search filters live, card click opens the drawer.
import { StatusDot } from "@/components/app/bits";
import { PlusIcon, SearchIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";
import { PEOPLE, avatarOf } from "@/lib/dayflow";

const KEY = [
  { label: "In office", status: "Present" },
  { label: "Half-day", status: "Half-day" },
  { label: "On leave", status: "Leave" },
  { label: "Absent", status: "Absent" },
];

export function People() {
  const s = useDayflow();
  const q = s.search.trim().toLowerCase();
  const shown = PEOPLE.filter((p) => !q || `${p.name} ${p.dept} ${p.role} ${p.id}`.toLowerCase().includes(q));

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
          onClick={() => s.toast("New employee form is out of scope for the mockup")}
          className="df-btn df-btn-primary flex-none"
          style={{ padding: "13px 20px", borderRadius: 14, fontSize: 14 }}
        >
          <PlusIcon size={15} />
          New employee
        </button>
      </div>

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
