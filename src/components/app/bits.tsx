// tiny repeated pieces: logo mark, avatars, status pills, dots.
import type { CSSProperties, ReactNode } from "react";
import { PlaneIcon } from "@/components/app/icons";
import { avatarOf, tone } from "@/lib/dayflow";

// dayflow blue squircle with a dot in it
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: "linear-gradient(160deg,#5872F5,#3C58D8 55%,#2B41A8)",
        boxShadow: "0 2px 6px rgba(43,65,168,.34), inset 0 1px 0 rgba(255,255,255,.45)",
      }}
    >
      <span
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: "50%",
          background: "rgba(255,255,255,.94)",
        }}
      />
    </span>
  );
}

// initials bubble, tinted per person
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const a = avatarOf(name);
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        background: a.tint,
        color: a.ink,
        fontSize: Math.round(size * 0.4),
        lineHeight: 1,
      }}
    >
      {a.init}
    </span>
  );
}

// leave days show as a rotated square, everything else a dot
// leave folk get a plane, everyone else a plain dot
export function StatusDot({ status, size = 7 }: { status: string; size?: number }) {
  const t = tone(status);
  const leave = status === "Leave" || status === "On leave";
  if (leave) return <PlaneIcon size={size + 4} style={{ color: t.dot, flex: "none" }} />;
  return (
    <span
      style={{
        width: size,
        height: size,
        background: t.dot,
        borderRadius: "50%",
        flex: "none",
      }}
    />
  );
}

// coloured capsule with a leading dot
export function StatusPill({ status, style }: { status: string; style?: CSSProperties }) {
  const t = tone(status);
  return (
    <span className="df-pill" style={{ background: t.bg, border: `1px solid ${t.bd}`, color: t.fg, ...style }}>
      <StatusDot status={status} size={6} />
      {status}
    </span>
  );
}

// small uppercase label over a value
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div
        style={{
          font: "500 11px/1 var(--font-geist-sans)",
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--df-ink5)",
        }}
      >
        {label}
      </div>
      <div style={{ margin: "8px 0 0", font: "450 13.5px/1.3 var(--font-geist-sans)" }}>{children}</div>
    </div>
  );
}

// grey rounded tile used inside the person drawer
export function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid rgba(16,19,23,.07)",
      }}
    >
      <div
        style={{
          font: "500 10.5px/1 var(--font-geist-sans)",
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "var(--df-ink5)",
        }}
      >
        {label}
      </div>
      <div style={{ margin: "8px 0 0", font: "450 13px/1.3 var(--font-geist-sans)" }}>{children}</div>
    </div>
  );
}

// one metric on a card: big number, quiet caption
export function Stat({ value, caption, color }: { value: ReactNode; caption: string; color?: string }) {
  return (
    <div className="df-card" style={{ padding: 18, borderRadius: 16 }}>
      <div className="df-mono" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: "-.016em", color }}>
        {value}
      </div>
      <div style={{ margin: "8px 0 0", font: "450 12px/1.3 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
        {caption}
      </div>
    </div>
  );
}
