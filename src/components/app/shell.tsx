"use client";

// app chrome: glass rail on the left, glass header on top, overlays on z.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Avatar, Mark } from "@/components/app/bits";
import {
  ApprovalIcon,
  BellIcon,
  CalendarIcon,
  CardIcon,
  CheckIcon,
  ClockIcon,
  ExitIcon,
  GridIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
} from "@/components/app/icons";
import { LeaveModal } from "@/components/app/leave-modal";
import { PersonDrawer } from "@/components/app/person-drawer";
import { useDayflow } from "@/components/app/store";
import { ALERTS } from "@/lib/dayflow";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  badge?: number;
};

const TITLES: Record<string, { emp: [string, string]; adm: [string, string] }> = {
  "/dashboard": { emp: ["Dashboard", ""], adm: ["Today at Dayflow", ""] },
  "/attendance": { emp: ["My attendance", ""], adm: ["Attendance", ""] },
  "/time-off": { emp: ["Time off", ""], adm: ["Approvals", ""] },
  "/pay": { emp: ["Pay", ""], adm: ["Payroll", ""] },
  "/profile": { emp: ["My profile", ""], adm: ["My profile", ""] },
  "/people": { emp: ["People", ""], adm: ["People", ""] },
};

export function Shell({ children }: { children: ReactNode }) {
  const s = useDayflow();
  const router = useRouter();
  const pathname = usePathname();

  // no session, no shell. proxy also blocks the route server-side.
  useEffect(() => {
    if (!s.loading && !s.me) router.replace("/signin");
  }, [s.loading, s.me, router]);

  const myPending = s.requests.filter((r) => r.status === "Pending").length;
  const pendingCount = myPending;

  const nav: NavItem[] = s.isEmp
    ? [
        { href: "/dashboard", label: "Dashboard", icon: GridIcon },
        { href: "/attendance", label: "Attendance", icon: ClockIcon },
        { href: "/time-off", label: "Time off", icon: CalendarIcon, badge: myPending },
        { href: "/pay", label: "Pay", icon: CardIcon },
        { href: "/profile", label: "My profile", icon: UserIcon },
      ]
    : [
        { href: "/dashboard", label: "Today", icon: GridIcon },
        { href: "/people", label: "People", icon: UsersIcon },
        { href: "/attendance", label: "Attendance", icon: ClockIcon },
        { href: "/time-off", label: "Approvals", icon: ApprovalIcon, badge: pendingCount },
        { href: "/pay", label: "Payroll", icon: CardIcon },
      ];

  const entry = TITLES[pathname] ?? TITLES["/dashboard"];
  const title = s.isEmp ? entry.emp[0] : entry.adm[0];
  const todayLine = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const subtitle = s.isEmp
    ? `${todayLine} · ${s.me?.profile.location ?? "Office"}`
    : `${s.people.length} employees · ${pendingCount} requests waiting on you`;

  if (s.loading || !s.me) return null;

  return (
    <div className="flex min-h-svh flex-col lg:h-svh lg:flex-row lg:overflow-hidden">
      {/* left rail */}
      <aside
        className="df-glass flex flex-none flex-col"
        style={{
          width: 250,
          margin: "14px 0 14px 14px",
          padding: "16px 14px",
          boxSizing: "border-box",
          borderRadius: 22,
        }}
      >
        <div className="flex items-center gap-2.5" style={{ padding: "4px 6px 0" }}>
          <Mark />
          <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
          <span
            className="df-mono ml-auto"
            style={{
              padding: "4px 8px",
              borderRadius: 7,
              background: "rgba(16,19,23,.055)",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: ".04em",
              color: "var(--df-ink3)",
            }}
          >
            {s.isEmp ? "EMPLOYEE" : "ADMIN"}
          </span>
        </div>

        <nav className="mt-[22px] flex flex-col gap-[3px]">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href} className="df-nav" data-on={pathname === href}>
              <Icon size={16} />
              {label}
              {badge ? (
                <span
                  className="df-mono ml-auto"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "rgba(180,114,10,.13)",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--df-amber-lo)",
                  }}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div
          className="mt-auto"
          style={{
            padding: 12,
            borderRadius: 14,
            background: "rgba(16,19,23,.035)",
            border: "1px solid rgba(16,19,23,.055)",
          }}
        >
          <p className="df-kicker" style={{ margin: "0 0 8px", fontSize: 10.5, letterSpacing: ".07em" }}>
            Signed in as
          </p>
          <div
            className="flex items-center justify-between"
            style={{
              padding: "9px 11px",
              borderRadius: 10,
              background: "rgba(255,255,255,.8)",
              border: "1px solid rgba(16,19,23,.06)",
            }}
          >
            <span style={{ font: "500 12.5px/1.3 var(--font-geist-sans)" }}>{s.me.name}</span>
            <span
              className="df-mono"
              style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: ".05em", color: "var(--df-indigo-lo)" }}
            >
              {s.isEmp ? "EMPLOYEE" : "HR ADMIN"}
            </span>
          </div>
          <p className="df-mono" style={{ margin: "8px 0 0", fontSize: 10.5, color: "var(--df-ink5)" }}>
            {s.me.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void s.signOut()}
          className="df-nav"
          style={{ margin: "10px 0 0", fontWeight: 450, fontSize: 13, color: "var(--df-ink3)" }}
        >
          <ExitIcon size={15} />
          Sign out
        </button>
      </aside>

      {/* main column */}
      <main className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <header
          className="df-glass-thin flex flex-none flex-wrap items-center gap-3.5"
          style={{ margin: "14px 14px 0", padding: "11px 16px", borderRadius: 18 }}
        >
          <div className="min-w-0">
            <div style={{ font: "600 15.5px/1.25 var(--font-geist-sans)", letterSpacing: "-.01em" }}>{title}</div>
            <div style={{ font: "400 12px/1.35 var(--font-geist-sans)", color: "var(--df-ink4)" }}>{subtitle}</div>
          </div>

          <div className="ml-auto flex items-center gap-[9px]">
            <HeaderSearch />

            <div className="relative">
              <button
                type="button"
                aria-label="Alerts"
                onClick={s.toggleBell}
                className="grid place-items-center"
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  border: "1px solid rgba(16,19,23,.08)",
                  background: "rgba(255,255,255,.66)",
                  cursor: "pointer",
                  color: "var(--df-ink2)",
                }}
              >
                <BellIcon size={16} />
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--df-red)",
                    border: "1.5px solid #fff",
                  }}
                />
              </button>

              {s.bellOpen ? (
                <div
                  className="df-float absolute"
                  style={{
                    top: 44,
                    right: 0,
                    width: 308,
                    padding: 8,
                    borderRadius: 16,
                    transformOrigin: "top right",
                    animation: "dfPop 180ms cubic-bezier(.23,1,.32,1)",
                    zIndex: 50,
                  }}
                >
                  <p className="df-kicker" style={{ margin: "6px 8px 8px", fontSize: 10.5, letterSpacing: ".07em" }}>
                    Alerts
                  </p>
                  {ALERTS.map((a) => (
                    <div
                      key={a.id}
                      className="df-row flex cursor-pointer gap-2.5"
                      style={{ padding: 10, borderRadius: 11, borderTop: "none" }}
                    >
                      <span
                        style={{
                          flex: "none",
                          width: 7,
                          height: 7,
                          marginTop: 5,
                          borderRadius: "50%",
                          background: a.dot,
                        }}
                      />
                      <span className="min-w-0">
                        <span style={{ display: "block", font: "500 13px/1.35 var(--font-geist-sans)" }}>{a.title}</span>
                        <span
                          style={{
                            display: "block",
                            marginTop: 2,
                            font: "400 12px/1.4 var(--font-geist-sans)",
                            color: "var(--df-ink4)",
                          }}
                        >
                          {a.meta}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-[9px]"
              style={{
                padding: "5px 12px 5px 5px",
                borderRadius: 999,
                background: "rgba(255,255,255,.66)",
                border: "1px solid rgba(16,19,23,.08)",
              }}
            >
              <Avatar name={s.me.name} size={27} />
              <span style={{ font: "500 12.5px/1 var(--font-geist-sans)", letterSpacing: "-.004em" }}>
                {s.me.name}
              </span>
            </Link>
          </div>
        </header>

        <div className="min-h-0 flex-1 lg:overflow-auto" style={{ padding: "20px 14px 28px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
        </div>
      </main>

      <PersonDrawer />
      <LeaveModal />
      <Toasts />
    </div>
  );
}

// header search: same pill, now alive. role-scoped hits from /api/search.
type Hit = { id: string; kind: string; title: string; sub: string; href: string; personId?: string };

const HIT_DOTS: Record<string, string> = {
  page: "#A6ACB6",
  person: "#3C58D8",
  profile: "#3C58D8",
  leave: "#6E56CF",
  day: "#0F8A5F",
};

function HeaderSearch() {
  const s = useDayflow();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // debounce the query, cancel the stale request
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(term), { signal: ctl.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setHits(data.results ?? []);
        setState("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  // cmd+k focuses, esc closes, click outside closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  function go(h: Hit) {
    setOpen(false);
    if (h.kind === "person" && h.personId) {
      s.setTab("resume");
      s.select(h.personId);
      router.push("/people");
      return;
    }
    router.push(h.href);
  }

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <div
        className="flex items-center gap-2"
        style={{
          padding: "8px 12px",
          borderRadius: 11,
          background: "rgba(255,255,255,.66)",
          border: "1px solid rgba(16,19,23,.08)",
        }}
      >
        <SearchIcon size={14} style={{ color: "var(--df-ink5)" }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < 2) {
              setHits([]);
              setState("idle");
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search"
          className="bg-transparent outline-none"
          style={{ font: "400 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink)", border: "none", width: 110 }}
        />
        <span
          className="df-mono"
          style={{
            padding: "2px 6px",
            borderRadius: 5,
            background: "rgba(16,19,23,.06)",
            fontSize: 10.5,
            fontWeight: 500,
            color: "var(--df-ink4)",
          }}
        >
          ⌘K
        </span>
      </div>

      {showPanel ? (
        <div
          className="df-float absolute"
          style={{
            top: 44,
            right: 0,
            width: 330,
            maxHeight: "60vh",
            overflowY: "auto",
            padding: 8,
            borderRadius: 16,
            transformOrigin: "top right",
            animation: "dfPop 180ms cubic-bezier(.23,1,.32,1)",
            zIndex: 50,
          }}
        >
          {state === "loading" ? (
            <p className="df-kicker" style={{ margin: "8px 10px 8px", fontSize: 10.5, letterSpacing: ".07em" }}>
              Searching…
            </p>
          ) : null}
          {state === "error" ? (
            <p style={{ margin: "8px 10px", font: "450 13px/1.4 var(--font-geist-sans)", color: "var(--df-red-lo)" }}>
              Search failed. Try again.
            </p>
          ) : null}
          {state === "done" && hits.length === 0 ? (
            <div style={{ padding: "10px 10px 8px" }}>
              <div style={{ font: "500 13px/1.3 var(--font-geist-sans)" }}>No results found</div>
              <p style={{ margin: "4px 0 0", font: "400 12px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                Nothing matches “{q.trim()}” in what you can access.
              </p>
            </div>
          ) : null}
          {hits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => go(h)}
              className="df-row flex w-full cursor-pointer gap-2.5 text-left"
              style={{ padding: 10, borderRadius: 11, borderTop: "none" }}
            >
              <span
                style={{
                  flex: "none",
                  width: 7,
                  height: 7,
                  marginTop: 5,
                  borderRadius: "50%",
                  background: HIT_DOTS[h.kind] ?? "#A6ACB6",
                }}
              />
              <span className="min-w-0">
                <span style={{ display: "block", font: "500 13px/1.35 var(--font-geist-sans)" }}>{h.title}</span>
                <span
                  style={{
                    display: "block",
                    marginTop: 2,
                    font: "400 12px/1.4 var(--font-geist-sans)",
                    color: "var(--df-ink4)",
                  }}
                >
                  {h.sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// bottom-right stack, three seconds each
function Toasts() {
  const { toasts } = useDayflow();
  return (
    <div
      className="fixed flex flex-col items-end gap-[9px]"
      style={{ right: 22, bottom: 22, zIndex: 80 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="df-float flex items-center gap-[11px]"
          style={{ padding: "13px 16px", borderRadius: 14, animation: "dfToast 320ms cubic-bezier(.23,1,.32,1)" }}
        >
          <span
            className="grid place-items-center"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: t.kind === "bad" ? "rgba(198,66,60,.1)" : "rgba(15,138,95,.1)",
              color: t.kind === "bad" ? "var(--df-red)" : "var(--df-green)",
            }}
          >
            <CheckIcon size={12} />
          </span>
          <span style={{ font: "500 13.5px/1.3 var(--font-geist-sans)", letterSpacing: "-.004em" }}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
