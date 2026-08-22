"use client";

// Axon landing — dark video hero (dot-matrix display type) + scrollable
// product/workflow/results sections. Design tokens live in landing.css;
// font + palette notes live in LANDING-DESIGN.md.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "./landing.css";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4";

const NAV_LINKS = [
  { label: "Home", href: "#top", active: true },
  { label: "Product", href: "#product", active: false },
  { label: "Workflow", href: "#workflow", active: false },
  { label: "Results", href: "#results", active: false },
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

// Raw-WebGL animated background for the sections below the hero: a warped fbm
// flow field in deep violet/teal on black (see LANDING-DESIGN.md). Renders at
// reduced resolution, pauses offscreen, and draws a single frame under
// prefers-reduced-motion.
const SHADER_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.05;

  vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 - t * 0.7 + 3.1));
  vec2 r = vec2(fbm(uv * 1.8 + 2.2 * q + vec2(1.7, 9.2) + t * 0.9),
                fbm(uv * 1.8 + 2.4 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(uv * 2.0 + 2.6 * r);

  vec3 violet = vec3(0.16, 0.10, 0.30);
  vec3 teal = vec3(0.05, 0.17, 0.19);
  vec3 col = violet * f * f * 1.5 + teal * pow(f, 3.0) * 1.7;

  float vig = smoothstep(1.3, 0.3, length(uv));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}`;

function ShaderField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const vs = "attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }";
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, SHADER_FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    // render at ~60% scale — it's a soft glow field, upscaling is free blur
    const scale = Math.min(window.devicePixelRatio, 1.5) * 0.6;
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const draw = () => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    draw();

    let raf = 0;
    let running = !reduced;
    if (running) raf = requestAnimationFrame(function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    });

    // pause the loop while the canvas is offscreen
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(function loop() {
          draw();
          raf = requestAnimationFrame(loop);
        });
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const countedRef = useRef(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // body scroll lock + escape/resize handlers for the mobile sheet
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    const onResize = () => window.innerWidth > 720 && closeMenu();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen, closeMenu]);

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

      {/* ── hero: header + trust + headline + CTA + stats over the video ── */}
      <section className="ax-hero">
        <video className="ax-bg-video" autoPlay muted loop playsInline>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        <header className="ax-header">
          <div className="ax-header-row">
            <Link href="/" className="ax-logo-btn" aria-label="Axon home">
              <AxonMark />
            </Link>

            <nav className="ax-nav" aria-label="Primary">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className={`ax-nav-link${l.active ? " is-active" : ""}`}>
                  {l.label}
                </a>
              ))}
            </nav>

            <Link href="/dashboard" className="ax-signin">
              Sign in
            </Link>

            <button
              type="button"
              className="ax-burger"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <div className="ax-hero-core">
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
        </div>

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

      {menuOpen && (
        <>
          <div className="ax-overlay" onClick={closeMenu} />
          <div className="ax-menu" role="dialog" aria-label="Menu">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`ax-menu-link${l.active ? " is-active" : ""}`}
                style={{ "--d": `${0.05 + i * 0.05}s` } as React.CSSProperties}
                onClick={closeMenu}
              >
                {l.label}
              </a>
            ))}
            <Link href="/dashboard" className="ax-menu-signin" onClick={closeMenu}>
              Sign in
            </Link>
          </div>
        </>
      )}

      {/* ── below the hero: animated shader field + dot grid behind sections ── */}
      <div className="ax-below">
        <ShaderField className="ax-below-canvas" />
        <div className="ax-below-dots" aria-hidden />

        {/* ── product: the four workflows our digital workers run ── */}
        <section className="ax-section" id="product">
        <div className="ax-section-inner">
          <div className="ax-section-head ax-io">
            <div className="ax-kicker">Product</div>
            <h2 className="ax-section-title">
              Every HR workflow
              <br />
              has a worker
            </h2>
          </div>
          <div className="ax-cards">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="ax-card ax-io"
                style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
              >
                <RingIcon icon={f.icon} className="ax-card-ring" />
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
              </article>
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
              <figure
                key={q.author}
                className="ax-quote ax-io"
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
              >
                <div className="ax-quote-mark" aria-hidden>
                  &quot;
                </div>
                <p>{q.text}</p>
                <cite>{q.author}</cite>
              </figure>
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
