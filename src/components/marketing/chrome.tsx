// marketing chrome: mark, sticky nav, footer. no client js — the mobile
// disclosure is a native <details>, so it works before hydration and after.
import Link from "next/link";

// blue squircle with a dot punched out. same mark the app wears.
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid flex-none place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        background: "var(--mk-brand)",
      }}
    >
      <span
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: "50%",
          background: "#fff",
        }}
      />
    </span>
  );
}

export function Wordmark({ size = 24, tone = "ink" }: { size?: number; tone?: "ink" | "light" }) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark size={size} />
      <span
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: size * 0.72,
          fontWeight: 600,
          letterSpacing: "-0.028em",
          lineHeight: 1,
          color: tone === "light" ? "#fff" : "var(--mk-ink)",
        }}
      >
        Dayflow
      </span>
    </span>
  );
}

const NAV = [
  { href: "#attendance", label: "Attendance" },
  { href: "#leave", label: "Leave" },
  { href: "#payroll", label: "Payroll" },
  { href: "#accounts", label: "Accounts" },
];

export function Nav() {
  return (
    <header
      className="sticky top-0 border-b bg-white/92"
      style={{
        zIndex: "var(--z-nav)",
        borderColor: "var(--mk-hair)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mk-wrap mk-wrap-wide flex h-16 items-center gap-8">
        <Link href="/" aria-label="Dayflow home" className="flex-none">
          <Wordmark />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="transition-colors"
              style={{
                fontSize: "0.9063rem",
                fontWeight: 500,
                letterSpacing: "-0.006em",
                color: "var(--mk-ink-2)",
                textDecoration: "none",
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden transition-colors sm:inline-flex"
            style={{
              fontSize: "0.9063rem",
              fontWeight: 600,
              color: "var(--mk-ink)",
              textDecoration: "none",
              padding: "8px 4px",
            }}
          >
            Sign in
          </Link>
          <Link href="/login/signup" className="mk-btn mk-btn-primary mk-btn-sm">
            Create workspace
          </Link>

          {/* mobile section list. native disclosure, zero javascript. */}
          <details className="relative md:hidden">
            <summary
              aria-label="Sections"
              className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg"
              style={{ border: "1px solid var(--mk-rule)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2 4.5h12M2 8h12M2 11.5h12" />
              </svg>
            </summary>
            <div
              className="absolute right-0 mt-2 flex w-52 flex-col overflow-hidden rounded-xl bg-white p-1.5"
              style={{
                zIndex: "var(--z-overlay)",
                border: "1px solid var(--mk-rule)",
                boxShadow: "0 18px 40px -18px rgba(11,13,18,.3)",
              }}
            >
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2.5"
                  style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--mk-ink-2)", textDecoration: "none" }}
                >
                  {n.label}
                </a>
              ))}
              <a
                href="/login"
                className="rounded-lg px-3 py-2.5 sm:hidden"
                style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mk-ink)", textDecoration: "none" }}
              >
                Sign in
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mk-on-dark mk-navy">
      <div className="mk-wrap mk-wrap-wide" style={{ paddingBlock: "56px 44px" }}>
        <hr className="mk-rule" style={{ marginBottom: 36 }} />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <Wordmark size={22} tone="light" />
          <p className="mk-body" style={{ margin: 0, fontSize: "0.875rem", maxWidth: "38ch" }}>
            Attendance, leave and payroll on one record.
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-x-7 gap-y-3">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                style={{ fontSize: "0.875rem", color: "var(--mk-on-navy-2)", textDecoration: "none" }}
              >
                {n.label}
              </a>
            ))}
            <Link href="/login" style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>
        </div>
        <p style={{ margin: "36px 0 0", fontSize: "0.8125rem", color: "var(--mk-on-navy-3)" }}>
          © 2026 Dayflow · Built for the Odoo × NMIT hackathon
        </p>
      </div>
    </footer>
  );
}
