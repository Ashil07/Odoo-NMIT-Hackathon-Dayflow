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

const PW_HINT = "At least 8 characters, including a number.";

// company sign-up: new org plus its first hr admin, then straight in
export function SignUpForm() {
  const router = useRouter();
  const { reload } = useDayflow();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pwOk = password.length >= 8 && /\d/.test(password);
  const matches = confirm.length > 0 && password === confirm;

  function localError(): string {
    if (companyName.trim().length < 2) return "Company name is required";
    if (fullName.trim().length < 2) return "Full name is required";
    if (!email.includes("@")) return "Enter a valid work email";
    if (!pwOk) return PW_HINT;
    if (password !== confirm) return "Passwords do not match";
    return "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const local = localError();
    if (local) {
      setError(local);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, fullName, email, password, confirmPassword: confirm }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not create the organization");
        return;
      }
      // session issued server-side; pull it in and land on the hr dashboard
      await reload();
      router.push("/dashboard");
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
        Create a workspace
      </h1>
      <p className="mk-body" style={{ marginTop: 12, fontSize: "0.9375rem" }}>
        This makes the company and the HR administrator who runs it. Every employee after that is
        provisioned from inside Dayflow — there is no public employee sign-up.
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
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p style={{ margin: "7px 0 0", fontSize: "0.75rem", color: "var(--mk-ink-3)" }}>
            The first two letters open every Login ID you issue.
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="mk-field" htmlFor="fullName">
            Admin / HR full name
          </label>
          <input
            id="fullName"
            name="name"
            className="mk-input"
            autoComplete="name"
            required
            placeholder="Tanvi Nair"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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

        <div style={{ marginTop: 16 }}>
          <label className="mk-field" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            className="mk-input"
            autoComplete="new-password"
            required
            aria-invalid={confirm.length > 0 && !matches ? true : undefined}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm.length > 0 ? (
            <p
              style={{
                margin: "7px 0 0",
                fontSize: "0.75rem",
                color: matches ? "var(--mk-ink-3)" : "#8f302b",
              }}
            >
              {matches ? "Passwords match." : "Passwords do not match."}
            </p>
          ) : null}
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
