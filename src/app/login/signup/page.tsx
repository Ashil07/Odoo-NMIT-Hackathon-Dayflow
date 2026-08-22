import type { Metadata } from "next";
import { AuthShell } from "@/components/marketing/auth-shell";
import { SignUpForm } from "@/components/marketing/auth-forms";
import { RegisterShot } from "@/components/marketing/shots";

export const metadata: Metadata = {
  title: "Create a workspace — Dayflow",
  description:
    "Create the HR administrator for your company. Every employee after that is provisioned from inside Dayflow.",
};

// one large object: the screen this workspace opens on.
function Aside() {
  return (
    <div className="flex h-full flex-col justify-center overflow-hidden py-16">
      <div className="pl-[clamp(40px,5vw,80px)] pr-14">
        <h2 className="mk-display" style={{ fontSize: "clamp(1.75rem,2.6vw,2.5rem)", maxWidth: "16ch" }}>
          This is Monday morning, from now on.
        </h2>
        <p className="mk-body" style={{ marginTop: 16, fontSize: "0.9375rem", maxWidth: "42ch" }}>
          The whole-company register, the day it is asked for. No export, no reconciliation.
        </p>
      </div>

      {/* pulled left by exactly the app sidebar width, so the panel edge crops
          navigation chrome and nothing else. every data column stays whole. */}
      <div className="mt-12 mr-14" style={{ marginLeft: -212 }}>
        <RegisterShot />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      aside={<Aside />}
      footer={
        <p style={{ margin: 0 }}>
          One workspace per company. Employees never sign up — HR creates the record and Dayflow
          issues the credentials.
        </p>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
