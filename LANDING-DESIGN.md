# Axon Landing — Design & Font Notes

Working reference for the landing page (`src/app/page.tsx` + `src/app/landing.css`,
branch `landing-page`). Everything here is deliberately centralized so we can
iterate on the identity without re-archaeology.

---

## Fonts

| Role | Family | Weights | Source | Status |
|---|---|---|---|---|
| UI / body | **Inter** | 400, 500, 600 | `next/font/google` (self-hosted, var `--font-inter`) | ✅ loaded in `layout.tsx` |
| Display / headlines / stat glyphs | **BubbledotICG-FinePos** (retro dot-matrix) | 400 | OnlineWebFonts CDN — `https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos` | ✅ via `<link>` in `page.tsx` |
| Display fallback | **Geist Pixel Circle** | 400 | local `fonts/GeistPixel-Circle.woff2` | ❌ **file not in repo** — stack currently falls to `monospace`. Drop the woff2 in + add `@font-face` in `landing.css` when we have it |
| Icons | **Font Awesome** 6.5.2 | — | cdnjs (`all.min.css`, integrity-pinned) | ✅ via `<link>` in `page.tsx` |

Font stacks (defined on `.ax-page`):

```css
--font-sans:    var(--font-inter), "Inter", "Segoe UI", system-ui, sans-serif;
--font-display: "BubbledotICG-FinePos", "Geist Pixel Circle", monospace;
```

Notes / open questions:
- BubbledotICG-FinePos only ships uppercase-style dot glyphs; numerals render as
  dots too — that's the retro look. It has **no real lowercase**, so keep display
  text short and title-case.
- OnlineWebFonts is a demo CDN. For production: buy the license (it's an ICG
  dot font) or self-host the woff2 the same way as Geist Pixel.
- Display font is used for: hero headline, section titles, step numbers, stat
  glyphs (`< % * #`), quote marks, final CTA title.
- Inter is used for: nav, subhead, CTA, stats values/labels, all section copy,
  footer.

## Color tokens (on `.ax-page` in landing.css)

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#000000` | page canvas |
| `--text` | `#ffffff` | primary text, headline |
| `--muted` | `#8e8e8e` | stat labels, kickers, footer links |
| `--nav-text` | `#2e2e2e` | text on white nav pill |
| `--pill-dark` | `#28282a` | sign-in pill, avatar rings, menu burger |
| `--sign-in-text` | `#c8c8c8` | sign-in label |
| `--trust-bg` / `--trust-border` | `#28282a` / `rgba(255,255,255,0.4)` | avatar rings, trust pill, card icon rings |
| `--trust-text` | `#c4c2c3` | trust pill copy |
| `--card-bg` / `--card-border` | `#101012` / `rgba(255,255,255,0.08)` | feature/quote cards, footer divider |
| `--nav-shadow` | `0 4px 14px rgba(0,0,0,0.16)` | soft shadow on pills/logo (kept light) |
| body copy | `#d0d0d0` (hero) / `#a8a8a8` (sections) | subhead, card text |

CTA glow (white pill): `0 0 0 1px rgba(255,255,255,.15), 0 0 22px rgba(255,255,255,.32), 0 0 44px rgba(255,255,255,.12)`.

## Type scale (clamp-based)

- Hero headline: `clamp(28px, 6.2vw, 80px)`, `letter-spacing -0.04em` (−0.08em ≤720px, −0.09em ≤420px), `line-height 1.12`
- Section titles: `clamp(26px, 4.6vw, 56px)`, same tracking language
- Subhead: `clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))`, opacity 0.8
- Nav links: `clamp(13px, 1.4vw, 15px)`, Inter 500, opacity 0.5 → 0.75 hover → 1 active
- Stat value: `clamp(18px, 2.2vw, 26px)`, tabular-nums; stat icon/glyph `clamp(22px, 3vw, 33px)`
- Card/step titles: 16–16.5px Inter 600; card copy 13.5px/1.6

## Signature components

- **Ring + white core**: every icon lives in a dark ring (`#28282a`, 1px white/40 border, 5px padding) with a solid white inner circle and black FA icon — used for trust avatars, card icons, step icons. This is *the* recurring shape language.
- **White pills**: nav pill (white, 999px radius) and CTA (white + glow) are the only bright elements.
- **Active nav indicator**: three 3px black dots under the label (`::after` + box-shadow offsets ±5px).
- **Stat glyphs**: literal `< % * #` characters set in the dot-matrix display font.
- **Axon mark**: the double-chevron SVG (256 viewBox, `#1B133C` on white) inside the circular white logo button, scaled to 72%.

## Motion

- Entrance (hero): `slideDown` header 0.7s; `.ax-anim` reveal 0.85s `cubic-bezier(0.22,1,0.36,1)` with staggered `--d` delays (trust .05s → stats .5–.74s); headline lines fade up at .12s/.3s; CTA uses `revealPulse`.
- Scroll sections: `.ax-io` → `.ax-in` via IntersectionObserver (threshold 0.15), same easing/blur(6px) reveal.
- Stats count-up: easeOutCubic, duration `1500 + i*80`ms, start offset `480 + i*90`ms, once (IO threshold 0.25).
- Mobile menu: overlay fade 0.28s, white sheet `menuIn` 0.38s, staggered `linkIn` links.
- `prefers-reduced-motion`: everything snaps to final state.

## Layout / breakpoints

- Hero = one viewport (`100dvh`, min 620px): header (top) → hero core (flex-1) → stats (bottom), all over the looping CloudFront video (`object-fit: cover`, `pointer-events: none`, z-0). Page scrolls after the hero.
- Sections: max-width 1080px, padding `clamp(72px, 11vh, 120px)` vertical.
- Breakpoints: 1020px (cards 4→2), 840px (steps→1col, quotes→1col), 720px (nav hidden + burger, stats 2×2, cards→1, headline tracking tightens), 420px (trust row shrinks), `max-height: 700px` (hero spacing tightens).

## Copy map (what says what)

- Hero H1: "Intelligence / For Every Workday" (nods to the Dayflow tagline).
- Subhead: digital workers running attendance, payroll, time-off.
- Trust row: odoo / slack / google brand icons + "Trusted by 2,000+ HR teams" (demo copy — swap for real proof before shipping).
- Stats: 120ms agent response · 99.99% payroll accuracy · 24/7 autonomous runtime · 40+ HR workflows automated (illustrative).
- Product cards = the four real app modules: **Attendance, Payroll, Time Off, People** (`fa-fingerprint`, `fa-file-invoice-dollar`, `fa-calendar-check`, `fa-id-card`).
- Workflow: connect stack → deploy worker → watch the day flow.
- Results: two illustrative testimonials (marked illustrative in footer).
- CTA "Get Started" / "Get Early Access" / "Sign in" all route to `/dashboard` for the demo.

## Background video

`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4`
(autoplay/muted/loop/playsInline, hero-scoped). Consider self-hosting before the
demo in case of CDN rate limits.

## Shader field (below the hero)

Everything after the hero (product → footer) sits on an animated WebGL
background (`ShaderField` in `page.tsx`, `.ax-below` in `landing.css`):

- **What**: single fullscreen-quad fragment shader — iq-style warped fbm flow
  field, deep violet `(0.16, 0.10, 0.30)` + teal `(0.05, 0.17, 0.19)` on black,
  vignette `smoothstep(1.3, 0.3, len(uv))`, time scale `0.05`. No libraries —
  raw WebGL1.
- **Layers** (bottom → top): shader canvas (`.ax-below-canvas`, z0) → dot grid
  (`.ax-below-dots`, z0, radial-gradient 1px dots @ 22px pitch, masked to the
  upper area, echoes the dot-matrix font) → black fade from hero edge
  (`.ax-below::before`, z1, ~160–280px) → section content (z1).
- **Performance**: renders at ~60% resolution (soft glow, free upscale blur),
  DPR capped 1.5; `IntersectionObserver` pauses the rAF loop offscreen;
  `prefers-reduced-motion` draws a single static frame.
- **Tuning**: colors/flow live in the `SHADER_FRAG` string; fade height in the
  `.ax-below::before` clamp; dot density in `.ax-below-dots` background-size.

## Prism (React Bits, ogl)

The first band below the hero (`.ax-prism-band`, `clamp(420px, 62vh, 620px)` tall)
renders the **Prism** component from React Bits — a raymarched pyramid with sine-band
color glow, film-grain noise, and a slow wobble (`animationType="rotate"`).

- Source: `src/components/landing/Prism.tsx` (TSX port of the JS variant) + `Prism.css`;
  dependency: `ogl` 1.x. Upstream: reactbits.dev.
- Props used: `timeScale 0.5`, `height 3.5`, `baseWidth 5.5`, `scale 3.6`,
  `glow 1`, `noise 0.5`, `colorFrequency 1`, `hueShift 0`, `suspendWhenOffscreen`
  (pauses the rAF loop when the band scrolls out of view).
- The transparent canvas sits over the fbm shader field, so the two blend.
- Caption overlay (`.ax-prism-caption`): kicker "Axon Core" + one-liner, non-interactive.
- Tuning: try `hueShift` (radians) to shift the palette, `colorFrequency` for band density,
  `scale` for size, `animationType="hover"` for pointer-tilt or `"3drotate"` for full tumble.

## Known gaps / next design passes

1. `fonts/GeistPixel-Circle.woff2` missing → mono fallback currently.
2. Bubbledot CDN license — self-host eventually.
3. Logo is inline SVG; the reference used `assets/logo.webp` in the white circle.
4. "Trusted by 2,000+" and stats are placeholder claims — needs real numbers or hedged copy.
5. Dark page meets light Dayflow app on `/dashboard` — a transition treatment (or dark app theme) is worth discussing.
