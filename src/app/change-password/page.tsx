"use client";

// forced first stop for temp-password users. no way past without a rotation.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark } from "@/components/app/bits";
import { useDayflow } from "@/components/app/store";


const inputStyle = {
  background: "#fff",
  padding: "12px 13px",
  fontSize: 14,
} as const;

export default function ChangePasswordPage() {
  const router = useRouter();
  const s = useDayflow();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = !s.loading;

  // no session: back to sign in. proxy already gates the other way.
  useEffect(() => {
    if (!s.loading && !s.me) router.replace("/login");
  }, [s.loading, s.me, router]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not change the password");
        return;
      }
      s.toast("Password updated");
      await s.reload();
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  const forced = s.me?.mustChangePassword === true;

  return (
    <div className="df-root grid min-h-svh place-items-center p-6">
      <div
        className="df-float w-full"
        style={{ maxWidth: 412, padding: "34px 34px 28px", borderRadius: 16, animation: "dfRise 320ms cubic-bezier(.23,1,.32,1)" }}
      >
        <div className="flex items-center gap-2.5">
          <Mark />
          <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
        </div>

        <h1 style={{ margin: "26px 0 6px", font: "600 27px/1.16 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
          {forced ? "Set your own password" : "Change password"}
        </h1>
        <p style={{ margin: "0 0 22px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
          {forced
            ? "HR issued a temporary password. Replace it to unlock Dayflow."
            : "Pick something new — 8+ characters with a number."}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Temporary password
            </label>
            <input
              className="df-input df-mono"
              style={inputStyle}
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              New password
            </label>
            <input
              className="df-input"
              style={inputStyle}
              type="password"
              placeholder="8+ characters, one number"
              value={next}
              onChange={(e) => setNext(e.target.value)}
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
          disabled={busy || !ready}
          onClick={() => void submit()}
          className="df-btn df-btn-primary"
          style={{ width: "100%", margin: "20px 0 0", padding: "13px 16px", fontSize: 14.5, opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Working…" : forced ? "Save and continue" : "Update password"}
        </button>
      </div>
    </div>
  );
}
