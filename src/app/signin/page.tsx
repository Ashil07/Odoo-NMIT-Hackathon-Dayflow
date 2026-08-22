"use client";

// sign in / sign up. role is chosen here but only honoured after it lands
// in the db — every api re-checks it from the user record anyway.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mark } from "@/components/app/bits";
import { CheckIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";

type Mode = "in" | "up";
type SignUpRole = "employee" | "hr_admin";

const inputStyle = {
  background: "rgba(255,255,255,.7)",
  padding: "12px 13px",
  fontSize: 14,
} as const;

function SignInCard() {
  const router = useRouter();
  const { reload } = useDayflow();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SignUpRole>("employee");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");

  // banner text falls out of the query param, no state needed
  const v = params.get("verified");
  const verifiedNote =
    v === "ok"
      ? "Email verified. Sign in to continue."
      : v === "bad"
        ? "That verification link is invalid or already used."
        : "";

  async function call(path: string, body: unknown): Promise<{ ok: boolean; error?: string; verifyUrl?: string }> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (mode === "in") {
        const d = await call("/api/auth/login", { email, password });
        if (!d.ok) {
          setError(d.error ?? "Sign in failed");
          return;
        }
        // provider mounted before the cookie existed; pull the session in
        await reload();
        router.push("/dashboard");
        router.refresh();
      } else {
        const d = await call("/api/auth/signup", { empId, email, password, role, name: name || undefined });
        if (!d.ok) {
          setError(d.error ?? "Sign up failed");
          return;
        }
        setVerifyUrl(d.verifyUrl ?? "");
      }
    } finally {
      setBusy(false);
    }
  }

  if (verifyUrl) {
    return (
      <div
        className="df-float w-full"
        style={{ maxWidth: 412, padding: "34px 34px 28px", borderRadius: 24, animation: "dfRise 320ms cubic-bezier(.23,1,.32,1)" }}
      >
        <div className="flex items-center gap-2.5">
          <Mark />
          <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
        </div>
        <h1 style={{ margin: "26px 0 6px", font: "600 27px/1.16 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
          Verify your email
        </h1>
        <p style={{ margin: "0 0 18px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
          One click and the account goes live. This build has no mailer, so the link is right here.
        </p>
        <a
          href={verifyUrl}
          className="df-btn df-btn-primary"
          style={{ width: "100%", padding: "13px 16px", fontSize: 14.5 }}
        >
          Verify email
        </a>
        <button
          type="button"
          onClick={() => {
            setVerifyUrl("");
            setMode("in");
          }}
          className="df-btn"
          style={{
            width: "100%",
            margin: "10px 0 0",
            borderColor: "rgba(16,19,23,.12)",
            background: "rgba(255,255,255,.7)",
            color: "var(--df-ink2)",
            fontSize: 14,
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div
      className="df-float w-full"
      style={{ maxWidth: 412, padding: "34px 34px 28px", borderRadius: 24, animation: "dfRise 320ms cubic-bezier(.23,1,.32,1)" }}
    >
      <div className="flex items-center gap-2.5">
        <Mark />
        <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
      </div>

      <h1 style={{ margin: "26px 0 6px", font: "600 27px/1.16 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
        {mode === "in" ? "Sign in to Dayflow" : "Create your account"}
      </h1>
      <p style={{ margin: "0 0 22px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
        {mode === "in"
          ? "Use the work email your HR officer registered."
          : "HR mints the Employee ID; the role travels with the record."}
      </p>

      {verifiedNote ? (
        <div
          className="mb-[16px] flex items-center gap-[9px]"
          style={{
            padding: "11px 13px",
            borderRadius: 12,
            background: verifiedNote.includes("invalid") ? "rgba(198,66,60,.08)" : "rgba(15,138,95,.08)",
            border: `1px solid ${verifiedNote.includes("invalid") ? "rgba(198,66,60,.2)" : "rgba(15,138,95,.2)"}`,
            font: "450 13px/1.4 var(--font-geist-sans)",
            color: verifiedNote.includes("invalid") ? "var(--df-red-lo)" : "var(--df-green-lo)",
          }}
        >
          <CheckIcon size={13} />
          {verifiedNote}
        </div>
      ) : null}

      <div className="df-seg" style={{ display: "flex", margin: "0 0 18px", borderRadius: 12 }}>
        <button type="button" className="df-seg-btn" style={{ flex: 1 }} data-on={mode === "in"} onClick={() => { setMode("in"); setError(""); }}>
          Sign in
        </button>
        <button type="button" className="df-seg-btn" style={{ flex: 1 }} data-on={mode === "up"} onClick={() => { setMode("up"); setError(""); }}>
          Sign up
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {mode === "up" ? (
          <>
            <div>
              <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
                Employee ID
              </label>
              <input
                className="df-input df-mono"
                style={inputStyle}
                placeholder="OIAARA20230012"
                value={empId}
                onChange={(e) => setEmpId(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
                Full name
              </label>
              <input className="df-input" style={inputStyle} placeholder="Aarav Rao" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
                Role
              </label>
              <div className="df-seg flex">
                <button type="button" className="df-seg-btn" style={{ flex: 1, padding: "10px 10px" }} data-on={role === "employee"} onClick={() => setRole("employee")}>
                  Employee
                </button>
                <button type="button" className="df-seg-btn" style={{ flex: 1, padding: "10px 10px" }} data-on={role === "hr_admin"} onClick={() => setRole("hr_admin")}>
                  HR Admin
                </button>
              </div>
            </div>
          </>
        ) : null}

        <div>
          <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
            Work email
          </label>
          <input
            className="df-input"
            style={inputStyle}
            type="email"
            placeholder="you@dayflow.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="mb-[7px] flex items-baseline justify-between">
            <label className="df-label" style={{ fontSize: 12.5 }}>
              Password
            </label>
            {mode === "in" ? (
              <span style={{ font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-indigo)", cursor: "pointer" }}>
                Forgot?
              </span>
            ) : null}
          </div>
          <input
            className="df-input"
            style={inputStyle}
            type="password"
            placeholder={mode === "up" ? "8+ characters with a number" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) void submit();
            }}
          />
          {mode === "up" ? (
            <div className="mt-[9px] flex items-center gap-[7px]">
              <span
                className="grid place-items-center"
                style={{ width: 14, height: 14, borderRadius: 5, background: "rgba(15,138,95,.14)" }}
              >
                <CheckIcon size={9} strokeWidth={3} style={{ color: "var(--df-green)" }} />
              </span>
              <span style={{ font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-green-lo)" }}>
                8+ characters with a number
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div
          style={{
            margin: "14px 0 0",
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

      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="df-btn df-btn-primary"
        style={{ width: "100%", margin: "20px 0 0", padding: "13px 16px", fontSize: 14.5, opacity: busy ? 0.7 : 1 }}
      >
        {busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"}
      </button>

      <div
        style={{
          margin: "18px 0 0",
          padding: "13px 14px",
          borderRadius: 13,
          background: "rgba(16,19,23,.04)",
          border: "1px solid rgba(16,19,23,.055)",
        }}
      >
        <p className="df-kicker" style={{ margin: 0, fontSize: 11.5 }}>
          Demo logins
        </p>
        <p style={{ margin: "9px 0 0", font: "400 12.5px/1.55 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
          Employee: aarav.rao@dayflow.co · HR: tanvi.nair@dayflow.co
          <br />
          Password for both: dayflow2026
        </p>
        <div className="mt-[11px] flex flex-wrap items-center gap-[9px]">
          <span
            className="df-mono"
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,.8)",
              border: "1px solid rgba(16,19,23,.08)",
              fontSize: 11.5,
              fontWeight: 500,
            }}
          >
            OI · AARA · 2023 · 0012
          </span>
          <span style={{ font: "400 11.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
            company · name · joining year · serial
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <Suspense>
        <SignInCard />
      </Suspense>
    </div>
  );
}
