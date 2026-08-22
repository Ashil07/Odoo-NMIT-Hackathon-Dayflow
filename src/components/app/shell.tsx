"use client";

// app chrome: glass rail on the left, glass header on top, overlays on z.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentType, type ReactNode } from "react";
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
import { ALERTS, PEOPLE } from "@/lib/dayflow";

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

  // no session, no shell. mockup guard, not real auth.
  useEffect(() => {
    if (!s.authed) router.replace("/");
  }, [s.authed, router]);

  const myPending = s.requests.filter((r) => r.status === "Pending" && r.who === "Aarav Rao").length;
  const pendingCount = s.requests.filter((r) => r.status === "Pending").length;

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
  const subtitle = s.isEmp
    ? "Friday 21 August 2026 · Bengaluru"
    : `${PEOPLE.length} employees · ${pendingCount} requests waiting on you`;

  if (!s.authed) return null;

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
            Viewing as
          </p>
          <div
            className="flex"
            style={{
              padding: 3,
              borderRadius: 10,
              background: "rgba(255,255,255,.8)",
              border: "1px solid rgba(16,19,23,.06)",
            }}
          >
            <button
              type="button"
              className="df-seg-btn"
              style={{ flex: 1, padding: "7px 6px", fontSize: 12 }}
              data-on={s.isEmp}
              onClick={() => {
                s.setRole("employee");
                router.push("/dashboard");
              }}
            >
              Employee
            </button>
            <button
              type="button"
              className="df-seg-btn"
              style={{ flex: 1, padding: "7px 6px", fontSize: 12 }}
              data-on={!s.isEmp}
              onClick={() => {
                s.setRole("admin");
                router.push("/dashboard");
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            s.signOut();
            router.push("/");
          }}
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
            <div
              className="hidden items-center gap-2 md:flex"
              style={{
                padding: "8px 12px",
                borderRadius: 11,
                background: "rgba(255,255,255,.66)",
                border: "1px solid rgba(16,19,23,.08)",
              }}
            >
              <SearchIcon size={14} style={{ color: "var(--df-ink5)" }} />
              <span style={{ font: "400 12.5px/1 var(--font-geist-sans)", color: "var(--df-ink5)" }}>Search</span>
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
              <Avatar name={s.isEmp ? "Aarav Rao" : "Tanvi Nair"} size={27} />
              <span style={{ font: "500 12.5px/1 var(--font-geist-sans)", letterSpacing: "-.004em" }}>
                {s.isEmp ? "Aarav Rao" : "Tanvi Nair"}
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
