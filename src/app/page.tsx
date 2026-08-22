// public landing. server-rendered, zero client javascript.
import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav } from "@/components/marketing/chrome";
import { ApprovalsShot, PayrollShot, RegisterShot, WeekShot } from "@/components/marketing/shots";

export const metadata: Metadata = {
  title: "Dayflow — one clock for the whole company",
  description:
    "Attendance, leave and payroll on one system of record. The hours your team checks in are the hours that price the pay run.",
};

const MODULES = [
  {
    name: "Attendance",
    claim: "One tap in, one tap out. Hours and overtime fall out of the stamps, day by day.",
    detail: "09:04 → 18:12 · +1.2h",
  },
  {
    name: "Leave",
    claim: "Requests carry their own documents and land in a single queue for HR.",
    detail: "24 paid · 7 sick · unpaid uncapped",
  },
  {
    name: "Payroll",
    claim: "Every component derives from the monthly wage. Unpaid days are already deducted.",
    detail: "basic → HRA → PF → net",
  },
];

const ID_PARTS = [
  { seg: "OI", label: "company" },
  { seg: "AARA", label: "name" },
  { seg: "2023", label: "joining year" },
  { seg: "0012", label: "serial" },
];

const GUARANTEES = [
  {
    head: "Role-scoped by default",
    body: "An employee reads their own record and nobody else's wage. HR sees the register; the register never sees HR.",
  },
  {
    head: "Checked on the server, twice",
    body: "Leave entitlements are enforced when the request is made and again when it is approved. The client is never trusted with the limit.",
  },
  {
    head: "Every decision is attributed",
    body: "Approvals, rejections and wage edits carry the person who made them and the moment they did.",
  },
];

export default function LandingPage() {
  return (
    <div className="mk">
      <Nav />

      <main>
        {/* ── hero ───────────────────────────────────────────────────── */}
        <section className="mk-wrap mk-wrap-wide" style={{ paddingTop: "clamp(56px, 7.5vw, 116px)" }}>
          <h1 className="mk-display mk-h1 mk-rise" style={{ animationDelay: "0ms" }}>
            One clock for
            <br />
            the whole company.
          </h1>

          <p className="mk-lead mk-rise" style={{ marginTop: "clamp(22px, 2.4vw, 32px)", animationDelay: "70ms" }}>
            Attendance, leave and payroll share one record. The hours your team checks in are the
            hours that price the pay run — no export, no reconciliation, no spreadsheet.
          </p>

          <div
            className="mk-rise flex flex-wrap items-center gap-3"
            style={{ marginTop: "clamp(28px, 3vw, 40px)", animationDelay: "140ms" }}
          >
            <Link href="/login/signup" className="mk-btn mk-btn-primary">
              Create a workspace
            </Link>
            <Link href="/login" className="mk-btn mk-btn-ghost">
              Sign in
            </Link>
          </div>

          <p
            className="mk-rise"
            style={{
              margin: "18px 0 0",
              fontSize: "0.875rem",
              color: "var(--mk-ink-3)",
              animationDelay: "200ms",
            }}
          >
            Sign-up creates the HR account for a company. Every employee after that is provisioned by HR.
          </p>
        </section>

        {/* the register, wider than the prose and overlapping the next band */}
        <div
          className="mk-wrap mk-wrap-wide mk-lift relative -mb-22 md:-mb-37.5"
          style={{ marginTop: "clamp(44px, 5vw, 76px)", zIndex: "var(--z-raise)", animationDelay: "240ms" }}
        >
          <RegisterShot />
        </div>

        {/* ── the map ────────────────────────────────────────────────── */}
        <section className="mk-panel">
          <div className="mk-wrap mk-wrap-wide pb-[clamp(72px,8vw,112px)] pt-34 md:pt-52.5">
            <div className="grid items-end gap-x-16 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <h2 className="mk-display mk-h2" style={{ maxWidth: 470 }}>
                Three modules. One record.
              </h2>
              <p className="mk-lead">
                Nothing is exported between them, because there is nothing to export.
              </p>
            </div>

            <div className="mt-[clamp(40px,4.5vw,64px)] grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => (
                <div key={m.name} style={{ borderTop: "1px solid var(--mk-rule)", paddingTop: 18 }}>
                  <h3 className="mk-display mk-h3">{m.name}</h3>
                  <p className="mk-body" style={{ marginTop: 10, fontSize: "0.9375rem" }}>
                    {m.claim}
                  </p>
                  <p
                    className="mk-mono"
                    style={{ margin: "14px 0 0", fontSize: "0.75rem", fontWeight: 500, color: "var(--mk-brand-lo)" }}
                  >
                    {m.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── attendance ─────────────────────────────────────────────── */}
        <section id="attendance" className="mk-navy mk-on-dark">
          <div className="mk-wrap mk-wrap-wide py-[clamp(72px,9vw,132px)]">
            <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,4.3fr)_minmax(0,7.7fr)]">
              <div>
                <h2 className="mk-display mk-h2">Every day carries its own arithmetic.</h2>
                <p className="mk-lead" style={{ marginTop: 20 }}>
                  Check in from a phone in the corridor. Dayflow stamps the minute, counts the hours
                  against the standard day, and separates the overtime — so the month closes itself.
                </p>
                <p className="mk-body" style={{ marginTop: 18, fontSize: "0.9375rem" }}>
                  A half-day is a half-day. An absence with no request stays an absence, and it
                  reaches payroll as one.
                </p>
              </div>
              <div>
                <WeekShot />
              </div>
            </div>
          </div>
        </section>

        {/* ── leave ──────────────────────────────────────────────────── */}
        <section id="leave">
          <div className="mk-wrap mk-wrap-wide py-[clamp(72px,9vw,132px)]">
            <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,7.7fr)_minmax(0,4.3fr)]">
              <div className="lg:order-1">
                <ApprovalsShot />
              </div>
              <div className="lg:order-2">
                <h2 className="mk-display mk-h2">Approve once. It is already in the payslip.</h2>
                <p className="mk-lead" style={{ marginTop: 20 }}>
                  Twenty-four paid days and seven sick days a year, enforced when the request is made
                  and again when it is approved.
                </p>
                <p className="mk-body" style={{ marginTop: 18, fontSize: "0.9375rem" }}>
                  Unpaid days are not a note for someone to remember. They come out of the pay run on
                  their own, with the working-day count shown beside the number.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── payroll ────────────────────────────────────────────────── */}
        <section id="payroll" className="mk-panel">
          <div className="mk-wrap py-[clamp(72px,9vw,132px)]">
            <div className="grid items-end gap-x-16 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <h2 className="mk-display mk-h2" style={{ maxWidth: 520 }}>
                Edit one number. The rest settles.
              </h2>
              <p className="mk-lead">
                HRA, bonus, LTA, provident fund and professional tax all derive from the monthly
                wage. There is nothing to keep in sync, so there is nothing to get wrong.
              </p>
            </div>

            <div className="mx-auto mt-[clamp(40px,5vw,68px)]" style={{ maxWidth: 900 }}>
              <PayrollShot />
            </div>
          </div>
        </section>

        {/* ── accounts ───────────────────────────────────────────────── */}
        <section id="accounts">
          <div className="mk-wrap mk-wrap-wide py-[clamp(72px,9vw,132px)]">
            <div>
              <h2 className="mk-display mk-h2" style={{ maxWidth: 660 }}>
                The account exists before the person does.
              </h2>
              <p className="mk-lead" style={{ marginTop: 20 }}>
                There is no public employee sign-up. HR creates the record, and Dayflow mints a Login
                ID and a one-time password on the spot.
              </p>
            </div>

            {/* the id itself is the image here */}
            <div className="mt-[clamp(44px,5vw,76px)] overflow-x-auto">
              <div className="flex min-w-max items-end" style={{ gap: "clamp(12px, 1.4vw, 22px)" }}>
                {ID_PARTS.map((p, i) => (
                  <div key={p.seg} className="flex flex-col">
                    <span
                      className="mk-mono"
                      style={{
                        fontSize: "clamp(1.75rem, 6.4vw, 4.25rem)",
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: "-0.035em",
                        color: i % 2 === 0 ? "var(--mk-ink)" : "var(--mk-brand)",
                      }}
                    >
                      {p.seg}
                    </span>
                    <span
                      style={{
                        marginTop: "clamp(12px, 1.4vw, 20px)",
                        paddingTop: 10,
                        borderTop: "1px solid var(--mk-rule)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--mk-ink-3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[clamp(48px,5.5vw,80px)] grid gap-x-10 gap-y-9 md:grid-cols-3">
              {GUARANTEES.map((g) => (
                <div key={g.head} style={{ borderTop: "1px solid var(--mk-rule)", paddingTop: 18 }}>
                  <h3 className="mk-display mk-h3">{g.head}</h3>
                  <p className="mk-body" style={{ marginTop: 10, fontSize: "0.9375rem" }}>
                    {g.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── close ──────────────────────────────────────────────────── */}
        <section className="mk-navy mk-on-dark">
          <div className="mk-wrap mk-wrap-wide py-[clamp(80px,10vw,148px)]">
            <h2 className="mk-display mk-h2" style={{ maxWidth: 560 }}>
              Give your team their day back.
            </h2>
            <p className="mk-lead" style={{ marginTop: 22 }}>
              Create the workspace, add your first employee, and close a month without opening a
              spreadsheet.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/login/signup" className="mk-btn mk-btn-light">
                Create a workspace
              </Link>
              <Link href="/login" className="mk-btn mk-btn-outline-light">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
