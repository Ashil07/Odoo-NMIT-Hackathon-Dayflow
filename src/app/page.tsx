"use client";

// sign in. no public sign-up: hr provisions every account.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mark } from "@/components/app/bits";
import { CheckIcon } from "@/components/app/icons";
import { useDayflow } from "@/components/app/store";

const inputStyle = {
  background: "rgba(255,255,255,.7)",
  padding: "12px 13px",
  fontSize: 14,
} as const;

function SignInCard() {
  const router = useRouter();
  const { reload } = useDayflow();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // banner text falls out of the query param, no state needed
  const v = params.get("verified");
  const verifiedNote =
    v === "ok"
      ? "Email verified. Sign in to continue."
      : v === "bad"
        ? "That verification link is invalid or already used."
        : "";

  async function submit() {
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
      // provider mounted before the cookie existed; pull the session in
      await reload();
      router.push(d.mustChangePassword ? "/change-password" : "/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
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
        Sign in to Dayflow
      </h1>
      <p style={{ margin: "0 0 22px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
        Use your Login ID or work email. Accounts are minted by HR.
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

      <div className="flex flex-col gap-3">
        <div>
          <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
            Login ID or email
          </label>
          <input
            className="df-input"
            style={inputStyle}
            placeholder="OIAARA20230012 or you@dayflow.co"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) void submit();
            }}
          />
        </div>
        <div>
          <div className="mb-[7px] flex items-baseline justify-between">
            <label className="df-label" style={{ fontSize: 12.5 }}>
              Password
            </label>
            <span style={{ font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-indigo)", cursor: "pointer" }}>
              Forgot?
            </span>
          </div>
          <input
            className="df-input"
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) void submit();
            }}
          />
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
        {busy ? "Working…" : "Sign in"}
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
