"use client";

// sign in. no public sign-up — HR mints the login id, we just show it.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mark } from "@/components/app/bits";
import { CheckIcon } from "@/components/app/icons";
import { useDayflow, type Role } from "@/components/app/store";

const CREDS: Record<Role, { id: string; email: string; label: string }> = {
  employee: { id: "OIAARA20230012", email: "aarav.rao@dayflow.co", label: "Employee" },
  admin: { id: "OITANA20200008", email: "tanvi.nair@dayflow.co", label: "Admin / HR" },
};

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useDayflow();
  const [role, setRole] = useState<Role>("employee");
  const creds = CREDS[role];

  function go() {
    signIn(role);
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div
        className="df-float w-full"
        style={{
          maxWidth: 412,
          padding: "34px 34px 28px",
          borderRadius: 24,
          animation: "dfRise 320ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Mark />
          <span style={{ font: "600 15px/1 var(--font-geist-sans)", letterSpacing: "-.014em" }}>Dayflow</span>
        </div>

        <h1 style={{ margin: "26px 0 6px", font: "600 27px/1.16 var(--font-geist-sans)", letterSpacing: "-.022em" }}>
          Sign in to Dayflow
        </h1>
        <p style={{ margin: "0 0 22px", font: "400 14px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
          Use the work email your HR officer registered.
        </p>

        <div className="df-seg" style={{ display: "flex", margin: "0 0 18px", borderRadius: 12 }}>
          <button
            type="button"
            className="df-seg-btn"
            style={{ flex: 1 }}
            data-on={role === "employee"}
            onClick={() => setRole("employee")}
          >
            Employee
          </button>
          <button
            type="button"
            className="df-seg-btn"
            style={{ flex: 1 }}
            data-on={role === "admin"}
            onClick={() => setRole("admin")}
          >
            Admin / HR
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Login ID
            </label>
            <input
              className="df-input df-mono"
              style={{ background: "rgba(255,255,255,.7)", padding: "12px 13px", fontSize: 14 }}
              value={creds.id}
              readOnly
            />
          </div>
          <div>
            <label className="df-label" style={{ margin: "0 0 7px", fontSize: 12.5 }}>
              Work email
            </label>
            <input
              className="df-input"
              style={{ background: "rgba(255,255,255,.7)", padding: "12px 13px", fontSize: 14 }}
              value={creds.email}
              readOnly
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
              type="password"
              style={{ background: "rgba(255,255,255,.7)", padding: "12px 13px", fontSize: 14 }}
              defaultValue="dayflow2026"
            />
            <div className="mt-[9px] flex items-center gap-[7px]">
              <span
                className="grid place-items-center"
                style={{ width: 14, height: 14, borderRadius: 5, background: "rgba(15,138,95,.14)" }}
              >
                <CheckIcon size={9} strokeWidth={3} style={{ color: "var(--df-green)" }} />
              </span>
              <span style={{ font: "450 12px/1 var(--font-geist-sans)", color: "var(--df-green-lo)" }}>
                Email verified · 8+ characters with a number
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={go}
          className="df-btn df-btn-primary"
          style={{ width: "100%", margin: "20px 0 0", padding: "13px 16px", fontSize: 14.5 }}
        >
          Continue as {creds.label}
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
            How accounts are made
          </p>
          <p style={{ margin: "9px 0 0", font: "400 12.5px/1.55 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
            There is no public sign-up. HR creates the employee, and Dayflow issues the Login ID and first password
            automatically.
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
    </div>
  );
}
