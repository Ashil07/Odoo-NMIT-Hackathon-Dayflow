# Product

## Register

brand (marketing surface: `/` and `/login`) over a product app (`/dashboard`, `/attendance`, `/pay`, `/people`, `/time-off`)

## Users

Two people, one system of record.

- **HR admin** at a small-to-mid company (8–200 people). Sits at a desk, closes a pay run once a month, approves leave weekly, provisions every account by hand. Their job to be done: stop reconciling attendance against a spreadsheet before payroll.
- **Employee** on the floor or at a desk. Checks in from a phone in a corridor, wants to know their leave balance without asking anyone. Their job to be done: one tap, correct hours, visible balance.

The landing page is read by the HR admin, not the employee — employees arrive already provisioned, with a Login ID in hand.

## Product Purpose

Dayflow is an HRMS where attendance, leave and payroll share one record. Hours checked in on the floor are the same hours that price the pay run; leave approved on Tuesday is already deducted on the 28th. Success is an HR admin closing a month without opening a spreadsheet.

## Brand Personality

Exact, plain-spoken, unhurried. Voice of a well-made instrument: it states the number and gets out of the way. Copy is declarative and concrete ("cut pay for unpaid days", "09:04 → 18:12, +1.2h"), never aspirational. Three words: **precise, calm, plainly-built**.

## Anti-references

- Purple/violet AI-slop gradients, aurora meshes, glowing orbs. The existing `--df-violet` radial in `.df-root` is exactly this and stays off the marketing surface.
- Emoji anywhere in UI or copy.
- Bubble soup: many small floating glass cards scattered across a hero. Space should be taken by **one large decisive thing**, not fifteen small ones.
- Hero-metric template (giant number + label + gradient accent).
- Repeated tiny uppercase tracked eyebrows above every section.
- Generic SaaS stock photography of smiling people at laptops.

## Design Principles

1. **Show the software, not a metaphor.** Every large visual is a real Dayflow screen with real values from the seed data. No illustration standing in for product.
2. **One idea per fold.** A section earns its height by making a single claim and showing it at scale.
3. **The number is the argument.** Concrete values (09:04, +1.2h, ₹71,240, 24/7 days) persuade better than adjectives.
4. **Space is confidence.** Large type, wide margins, few elements. Emptiness reads as certainty; density reads as anxiety.
5. **Practice what you preach.** An HRMS selling precision cannot ship a page with sloppy alignment or drifting baselines.

## Accessibility & Inclusion

- WCAG 2.2 AA. Body text ≥4.5:1, large display ≥3:1, verified against the actual surface color, not assumed.
- Every animation has a `prefers-reduced-motion: reduce` path; the page is fully legible with zero motion.
- Status is never carried by color alone — attendance states pair a hue with a shape (dot / plane) and a word.
- Full keyboard path through nav, hero CTAs, and both auth forms; visible focus rings on the brand indigo.
