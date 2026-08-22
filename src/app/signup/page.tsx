"use client";

// company sign-up: new org + first hr admin. not employee self-register.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mark } from "@/components/app/bits";
import { CheckIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";

const inputStyle = {
  background: "rgba(255,255,255,.7)",
  padding: "12px 13px",
  fontSize: 14,
} as const;

export default function SignUpPage() {
  const router = useRouter();
  const { reload } = useDayflow();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function localError(): string {
    if (!companyName.trim()) return "Company name is required";
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (password.length < 8 || !/\d/.test(password)) return "Password needs 8+ characters with a number";
    if (password !== confirm) return "Passwords do not match";
    return "";
  }

  async function submit() {
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
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div
        className="df-float w-full"
        style={{ maxWidth: 412, padding: "34px 34px 28px", borderRadius: 24, animation: "dfRise 320ms cubic-bezier(.23,1,.32,1)" }}
      >
        <div className="flex items-center gap-2.5">
          <Mark />
          <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
        </div>

        <h1 style={{ margin: "26px 0 6px", font: "600 27px/1.16 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
          Create your organization
        </h1>
        <p style={{ margin: "0 0 22px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
          One form, one company, one admin. Employees join later by invitation from HR.
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Company name
            </label>
            <input
              className="df-input"
              style={inputStyle}
              placeholder="Odoo India"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Admin / HR full name
            </label>
            <input
              className="df-input"
              style={inputStyle}
              placeholder="Tanvi Nair"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Admin / HR email
            </label>
            <input
              className="df-input"
              style={inputStyle}
              type="email"
              placeholder="you@company.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Password
            </label>
            <input
              className="df-input"
              style={inputStyle}
              type="password"
              placeholder="8+ characters with a number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Confirm password
            </label>
            <input
              className="df-input"
              style={inputStyle}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) void submit();
              }}
            />
            {password.length > 0 && password === confirm && password.length >= 8 && /\d/.test(password) ? (
              <div className="mt-[9px] flex items-center gap-[7px]">
                <span
                  className="grid place-items-center"
                  style={{ width: 14, height: 14, borderRadius: 5, background: "rgba(15,138,95,.14)" }}
                >
                  <CheckIcon size={9} strokeWidth={3} style={{ color: "var(--df-green)" }} />
                </span>
                <span style={{ font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-green-lo)" }}>
                  Passwords match
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
          {busy ? "Working…" : "Create organization"}
        </button>

        <p style={{ margin: "16px 0 0", textAlign: "center", font: "450 13px/1.4 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
          Already have an account?{" "}
          <Link href="/" style={{ color: "var(--df-indigo)", cursor: "pointer" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
