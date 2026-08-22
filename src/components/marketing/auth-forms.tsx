"use client";

// the two auth forms. sign-in accepts a Login ID or a work email; sign-up
// creates a company workspace and the HR admin who runs it — never an
// employee, those are provisioned from inside the app.
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useDayflow } from "@/components/app/store";

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity=".28" strokeWidth="2.2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── sign in ───────────────────────────────────────────────────────────── */

export function SignInForm() {
  const router = useRouter();
  const { reload } = useDayflow();
  const params = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const verified = params.get("verified");
  const banner =
    verified === "ok"
      ? { tone: "good" as const, text: "Email verified. Sign in to continue." }
      : verified === "bad" || verified === "missing"
        ? { tone: "bad" as const, text: "That verification link is invalid or already used." }
        : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!identifier.trim() || !password) {
      setError("Enter your Login ID or work email, and your password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Sign in failed");
        return;
      }
      // the provider mounted before the cookie existed. pull the session in.
      await reload();
      router.push(d.mustChangePassword ? "/change-password" : "/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mk-display" style={{ fontSize: "clamp(1.875rem,3.4vw,2.375rem)", lineHeight: 1.06 }}>
        Sign in to Dayflow
      </h1>
      <p className="mk-body" style={{ marginTop: 12, fontSize: "0.9375rem" }}>
        Use the Login ID your HR officer issued, or the work email on your record.
      </p>

      {banner ? (
        <p className={`mk-note mk-note-${banner.tone}`} style={{ marginTop: 22 }} role="status">
          {banner.text}
        </p>
      ) : null}

      <form onSubmit={submit} noValidate style={{ marginTop: 26 }}>
        <div>
          <label className="mk-field" htmlFor="identifier">
            Login ID or work email
          </label>
          <input
            id="identifier"
            name="identifier"
            className="mk-input"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
            placeholder="OIAARA20230012"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "signin-error" : undefined}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="mk-field" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mk-input"
            autoComplete="current-password"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "signin-error" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <p id="signin-error" className="mk-note mk-note-bad" style={{ marginTop: 16 }} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mk-btn mk-btn-primary"
          style={{ width: "100%", marginTop: 22 }}
        >
          {busy ? (
            <>
              <Spinner />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mk-body" style={{ marginTop: 22, fontSize: "0.875rem" }}>
        Setting up a company?{" "}
        <Link href="/login/signup" className="mk-link">
          Create a workspace
        </Link>
        .
      </p>

      <div
        style={{
          marginTop: 26,
          paddingTop: 18,
          borderTop: "1px solid var(--mk-rule)",
          fontSize: "0.8125rem",
          color: "var(--mk-ink-3)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "var(--mk-ink-2)" }}>Demo logins</p>
        <p style={{ margin: "6px 0 0" }}>
          Employee <span className="mk-mono">aarav.rao@dayflow.co</span> · HR{" "}
          <span className="mk-mono">tanvi.nair@dayflow.co</span>
          <br />
          Password for both: <span className="mk-mono">dayflow2026</span>
        </p>
      </div>
    </div>
  );
}

/* ── sign up ───────────────────────────────────────────────────────────── */

type Created = { admin: { name: string; empId: string; email: string }; verifyUrl: string };

const PW_HINT = "At least 8 characters, including a number.";

export function SignUpForm() {
  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Created | null>(null);

  const pwOk = password.length >= 8 && /\d/.test(password);
  const ready = company.trim().length >= 2 && firstName.trim().length >= 2 && lastName.trim().length >= 2 && email.includes("@") && pwOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!ready) {
      setError(
        !pwOk && password.length > 0
          ? PW_HINT
          : "Fill in the company, your name, a work email and a password.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, firstName, lastName, email, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not create the workspace");
        return;
      }
      setDone(d as Created);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="mk-display" style={{ fontSize: "clamp(1.875rem,3.4vw,2.375rem)", lineHeight: 1.06 }}>
          Workspace created.
        </h1>
        <p className="mk-body" style={{ marginTop: 12, fontSize: "0.9375rem" }}>
          {done.admin.name} is the HR administrator for {company}. This is the Login ID Dayflow
          minted — it works anywhere the email does.
        </p>

        <p
          className="mk-mono"
          style={{
            margin: "24px 0 0",
            padding: "16px 18px",
            borderRadius: 12,
            border: "1px solid var(--mk-rule)",
            background: "var(--mk-panel)",
            fontSize: "clamp(1.125rem,2.4vw,1.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            wordBreak: "break-all",
          }}
        >
          {done.admin.empId}
        </p>

        <p className="mk-note mk-note-info" style={{ marginTop: 18 }}>
          This build ships without a mailer, so the verification link is handed back directly
          instead of being emailed to {done.admin.email}.
        </p>

        <a href={done.verifyUrl} className="mk-btn mk-btn-primary" style={{ width: "100%", marginTop: 20 }}>
          Verify email and continue
        </a>

        <p className="mk-body" style={{ marginTop: 16, fontSize: "0.875rem" }}>
          Already verified?{" "}
          <Link href="/login" className="mk-link">
            Go to sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mk-display" style={{ fontSize: "clamp(1.875rem,3.4vw,2.375rem)", lineHeight: 1.06 }}>
        Create a workspace
      </h1>
      <p className="mk-body" style={{ marginTop: 12, fontSize: "0.9375rem" }}>
        This makes the HR administrator for your company. Every employee after that is provisioned
        from inside Dayflow — there is no public employee sign-up.
      </p>

      <form onSubmit={submit} noValidate style={{ marginTop: 26 }}>
        <div>
          <label className="mk-field" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            name="organization"
            className="mk-input"
            autoComplete="organization"
            required
            placeholder="Odoo India"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <p style={{ margin: "7px 0 0", fontSize: "0.75rem", color: "var(--mk-ink-3)" }}>
            The first two letters open every Login ID you issue.
          </p>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="mk-field" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              name="given-name"
              className="mk-input"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="mk-field" htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              name="family-name"
              className="mk-input"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="mk-field" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mk-input"
            autoComplete="email"
            required
            placeholder="you@company.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="mk-field" htmlFor="new-password">
            Password
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            className="mk-input"
            autoComplete="new-password"
            required
            aria-describedby="pw-hint"
            aria-invalid={password.length > 0 && !pwOk ? true : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p
            id="pw-hint"
            style={{
              margin: "7px 0 0",
              fontSize: "0.75rem",
              color: password.length > 0 && !pwOk ? "#8f302b" : "var(--mk-ink-3)",
            }}
          >
            {PW_HINT}
          </p>
        </div>

        {error ? (
          <p className="mk-note mk-note-bad" style={{ marginTop: 18 }} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mk-btn mk-btn-primary"
          style={{ width: "100%", marginTop: 22 }}
        >
          {busy ? (
            <>
              <Spinner />
              Creating workspace
            </>
          ) : (
            "Create workspace"
          )}
        </button>
      </form>

      <p className="mk-body" style={{ marginTop: 22, fontSize: "0.875rem" }}>
        Already have a Login ID?{" "}
        <Link href="/login" className="mk-link">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
