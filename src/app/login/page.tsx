import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/marketing/auth-shell";
import { SignInForm } from "@/components/marketing/auth-forms";

export const metadata: Metadata = {
  title: "Sign in — Dayflow",
  description: "Sign in with the Login ID your HR officer issued, or the work email on your record.",
};

const PARTS = [
  { seg: "OI", label: "company" },
  { seg: "AARA", label: "name" },
  { seg: "2023", label: "joining year" },
  { seg: "0012", label: "serial" },
];

// the aside answers the only question the form raises: what is a Login ID?
function Aside() {
  return (
    <div className="px-[clamp(40px,5vw,80px)] py-16">
      <h2 className="mk-display" style={{ fontSize: "clamp(1.75rem,2.6vw,2.5rem)", maxWidth: "17ch" }}>
        Your Login ID says where you started.
      </h2>

      <div className="mt-12 flex flex-wrap items-end" style={{ gap: "clamp(12px, 1.2vw, 20px)" }}>
        {PARTS.map((p, i) => (
          <div key={p.seg} className="flex flex-col">
            <span
              className="mk-mono"
              style={{
                fontSize: "clamp(1.5rem,2.6vw,2.5rem)",
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: i % 2 === 0 ? "#fff" : "var(--mk-brand-lift)",
              }}
            >
              {p.seg}
            </span>
            <span
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: "1px solid var(--mk-rule-dark)",
                fontSize: "0.75rem",
                color: "var(--mk-on-navy-3)",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mk-body" style={{ marginTop: 40, fontSize: "0.9375rem", maxWidth: "44ch" }}>
        HR mints it once, when your record is created. It never changes, and it works anywhere your
        work email does.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      aside={<Aside />}
      footer={
        <p style={{ margin: 0 }}>
          Accounts are provisioned by HR. If you do not have a Login ID yet, ask your HR officer.
        </p>
      }
    >
      <Suspense fallback={<div style={{ minHeight: 460 }} />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
