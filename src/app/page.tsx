"use client";

// Axon landing — dark video hero (dot-matrix display type) + scrollable
// product/workflow/results sections. Design tokens live in landing.css;
// font + palette notes live in LANDING-DESIGN.md.

import Link from "next/link";
import { useEffect, useRef } from "react";
import PillNav from "@/components/landing/PillNav";
import Grainient from "@/components/landing/Grainient";
import BorderGlow from "@/components/landing/BorderGlow";
import "./landing.css";

const NAV_LINKS = [
  { label: "Home", href: "#top", active: true },
  { label: "Product", href: "#product", active: false },
  { label: "Workflow", href: "#workflow", active: false },
  { label: "Results", href: "#results", active: false },
];

const PILL_ITEMS = [
  ...NAV_LINKS.map(({ label, href }) => ({ label, href })),
  { label: "Sign in", href: "/dashboard" },
];

const STATS = [
  { glyph: "<", target: 120, suffix: "ms", decimals: 0, label: "Agent Response" },
  { glyph: "%", target: 99.99, suffix: "%", decimals: 2, label: "Payroll Accuracy" },
  { glyph: "*", target: 24, suffix: "/7", decimals: 0, label: "Autonomous Runtime" },
  { glyph: "#", target: 40, suffix: "+", decimals: 0, label: "HR Workflows Automated" },
];

const FEATURES = [
  {
    icon: "fa-fingerprint",
    title: "Attendance",
    copy: "Digital workers track every clock-in, catch anomalies early and close the period without a single spreadsheet.",
  },
  {
    icon: "fa-file-invoice-dollar",
    title: "Payroll",
    copy: "Pay runs draft themselves from live attendance and leave data. You review edge cases — Axon does the arithmetic.",
  },
  {
    icon: "fa-calendar-check",
    title: "Time Off",
    copy: "Leave requests balance-check, route and approve themselves against policy. Humans only step in for exceptions.",
  },
  {
    icon: "fa-id-card",
    title: "People",
    copy: "Records, onboarding and role changes stay current because an agent maintains them around the clock.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: "fa-plug",
    title: "Connect your stack",
    copy: "Point Axon at your HR source of truth. It learns your policies, org chart and pay rules.",
  },
  {
    num: "02",
    icon: "fa-user-gear",
    title: "Deploy a worker",
    copy: "Choose a workflow and assign a digital worker to it. Setup takes minutes, not sprints.",
  },
  {
    num: "03",
    icon: "fa-gauge-high",
    title: "Watch the day flow",
    copy: "Exceptions surface on one dashboard. Everything else quietly handles itself.",
  },
];

const QUOTES = [
  {
    text: "We got two days a week back within the first month. Attendance just runs now — nobody opens a tracker anymore.",
    author: "People Lead, 240-person services firm",
  },
  {
    text: "Payroll used to be three days of spreadsheets. Now the draft is waiting before we're out of bed.",
    author: "Operations Director, 180-person studio",
  },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function AxonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" role="img" aria-label="Axon logo" className={className}>
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#1B133C" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#1B133C" />
    </svg>
  );
}

function RingIcon({ icon, className }: { icon: string; className: string }) {
  return (
    <div className={className}>
      <div className={`${className}-inner`}>
        <i className={`fa-solid ${icon}`} aria-hidden />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const countedRef = useRef(false);

  // count-up stats (once, when the stats row scrolls into view)
  useEffect(() => {
    const statsEl = statsRef.current;
    if (!statsEl || countedRef.current) return;

    const values = Array.from(statsEl.querySelectorAll<HTMLElement>("[data-target]"));
    let rafs: number[] = [];

    const run = () => {
      if (countedRef.current) return;
      countedRef.current = true;
      values.forEach((el, i) => {
        const target = Number(el.dataset.target);
        const decimals = Number(el.dataset.decimals ?? 0);
        const duration = 1500 + i * 80;
        const start = performance.now() + 480 + i * 90;
        const tick = (now: number) => {
          const t = Math.min(Math.max((now - start) / duration, 0), 1);
          el.textContent = (target * easeOutCubic(t)).toFixed(decimals);
          if (t < 1) rafs[i] = requestAnimationFrame(tick);
        };
        rafs[i] = requestAnimationFrame(tick);
      });
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.25 }
    );
    io.observe(statsEl);
    return () => {
      io.disconnect();
      rafs.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  // scroll-reveal for below-the-fold sections
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".ax-io"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ax-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="ax-page" id="top" ref={pageRef}>
      {/* display font (OnlineWebFonts CDN) + brand icons */}
      <link
        rel="stylesheet"
        href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <PillNav
        className="ax-pillnav"
        logo={<AxonMark />}
        logoAlt="Axon"
        items={PILL_ITEMS}
        activeHref="#top"
        baseColor="#ffffff"
        pillColor="#1B133C"
        hoveredPillTextColor="#1B133C"
        pillTextColor="#ffffff"
        initialLoadAnimation
      />

      {/* ── the whole page runs on the Grainient gradient ── */}
      <div className="ax-below">
        <div className="ax-below-gradient" aria-hidden>
          <Grainient
            color1="#121418"
            color2="#412d8d"
            color3="#000000"
            timeSpeed={0.4}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={3.4}
            warpSpeed={3.5}
            warpAmplitude={12}
            blendAngle={0}
            blendSoftness={0.1}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={4.4}
            grainAnimated
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>
        <div className="ax-below-dots" aria-hidden />

        {/* ── hero copy — sits below the floating nav, over the gradient ── */}
        <section className="ax-hero-block">
          <div className="ax-trust ax-anim" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <div className="ax-avatar">
              <div className="ax-avatar-inner">
                <i className="fa-brands fa-odoo" aria-hidden />
              </div>
            </div>
            <div className="ax-avatar">
              <div className="ax-avatar-inner">
                <i className="fa-brands fa-slack" aria-hidden />
              </div>
            </div>
            <div className="ax-avatar">
              <div className="ax-avatar-inner">
                <i className="fa-brands fa-google" aria-hidden />
              </div>
            </div>
            <div className="ax-trust-pill">Trusted by 2,000+ HR teams</div>
          </div>

          <h1 className="ax-headline">
            <span>Intelligence</span>
            <span>For Every Workday</span>
          </h1>

          <p className="ax-subhead ax-anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            Axon deploys digital workers that run attendance, payroll and time-off for you — a
            modular agent platform built for production HR.
          </p>

          <Link href="/dashboard" className="ax-cta ax-anim" style={{ "--d": "0.4s" } as React.CSSProperties}>
            Get Started
          </Link>

          <div className="ax-stats" ref={statsRef}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="ax-stat ax-anim"
                style={{ "--d": `${0.5 + i * 0.08}s` } as React.CSSProperties}
              >
                <div className="ax-stat-icon" aria-hidden>
                  {s.glyph}
                </div>
                <div className="ax-stat-value">
                  <span data-target={s.target} data-decimals={s.decimals}>
                    {(0).toFixed(s.decimals)}
                  </span>
                  {s.suffix}
                </div>
                <div className="ax-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── product intro ── */}
        <section className="ax-product-band" id="product" aria-label="Product">
          <div className="ax-section-head ax-io">
            <div className="ax-kicker">Product</div>
            <h2 className="ax-section-title">
              Every HR workflow
              <br />
              has a worker
            </h2>
          </div>
        </section>

        {/* ── product: the four workflows our digital workers run ── */}
        <section className="ax-section ax-section-tight">
          <div className="ax-section-inner">
            <div className="ax-cards">
            {FEATURES.map((f, i) => (
              <BorderGlow
                key={f.title}
                className="ax-card-glow ax-io"
                style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
                backgroundColor="rgba(10, 7, 22, 0.55)"
                borderRadius={24}
                glowRadius={32}
                glowColor="258 90 78"
                glowIntensity={1}
                edgeSensitivity={30}
                colors={["#c084fc", "#818cf8", "#412d8d"]}
              >
                <RingIcon icon={f.icon} className="ax-card-ring" />
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* ── workflow: three steps to automated HR ── */}
      <section className="ax-section" id="workflow">
        <div className="ax-section-inner">
          <div className="ax-section-head ax-io">
            <div className="ax-kicker">How it works</div>
            <h2 className="ax-section-title">
              From zero
              <br />
              to automated
            </h2>
          </div>
          <div className="ax-steps">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="ax-step ax-io"
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
              >
                <div className="ax-step-num" aria-hidden>
                  {s.num}
                </div>
                <RingIcon icon={s.icon} className="ax-step-ring" />
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── results ── */}
      <section className="ax-section" id="results">
        <div className="ax-section-inner">
          <div className="ax-section-head ax-io">
            <div className="ax-kicker">Results</div>
            <h2 className="ax-section-title">
              Teams feel it
              <br />
              in week one
            </h2>
          </div>
          <div className="ax-quotes">
            {QUOTES.map((q, i) => (
              <BorderGlow
                key={q.author}
                className="ax-quote-glow ax-io"
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
                backgroundColor="rgba(10, 7, 22, 0.55)"
                borderRadius={24}
                glowRadius={32}
                glowColor="258 90 78"
                glowIntensity={1}
                edgeSensitivity={30}
                colors={["#c084fc", "#818cf8", "#412d8d"]}
              >
                <div className="ax-quote-mark" aria-hidden>
                  &quot;
                </div>
                <p>{q.text}</p>
                <cite>{q.author}</cite>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* ── final CTA + footer ── */}
      <section className="ax-section ax-final" id="contact">
        <div className="ax-section-inner ax-io">
          <h2 className="ax-final-title">
            Put your workday
            <br />
            on autopilot
          </h2>
          <p className="ax-final-sub">Deploy your first digital worker in minutes.</p>
          <Link href="/dashboard" className="ax-cta">
            Get Early Access
          </Link>
        </div>
      </section>

      <footer className="ax-footer">
        <div className="ax-footer-inner">
          <div className="ax-footer-brand">
            <span className="ax-logo-btn" style={{ width: 34, height: 34 }}>
              <AxonMark />
            </span>
            Axon
          </div>
          <nav className="ax-footer-links" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="ax-footer-note">
          Built for the Odoo × NMIT Hackathon · Illustrative figures from pilot deployments ·
          © 2026 Axon
        </div>
      </footer>
      </div>
    </div>
  );
}
