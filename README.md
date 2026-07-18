# Handoff: Knowhere.me Marketing Website

## Overview
Public marketing site for **Knowhere** — a study app for senior high-school / early-college students that rebuilds every concept to fit the learner (style × neurology × mode). Five live pages sharing one navigation, one design language, one animated particle system, and one global footer:

1. **Home** (`index.html`) — scroll-driven hero: an IYKYK video-text-mask banner that disintegrates into particles on scroll, particles that assemble the wordmark, a "learning fingerprint" section, a kinetic finale, and the global footer. **This is the site's landing page / index.**
2. **How it works** (`how-it-works.html`) — the learning model explained.
3. **For parents** (`for-parents.html`) — reassurance + value for parents.
4. **Pricing** (`pricing.html`) — plans and value.
5. **Experience it** (`experience-it.html`) — the product experience / modes.

Pages 2–5 share identical chrome: a sticky blurred **nav**, a full-bleed **particle page-banner** with a frosted-glass title, page content, then the shared **global footer**. Home is bespoke but pulls in the same nav treatment and footer.

> **Note:** an earlier concept, `Knowhere Landing.dc.html`, is **NOT part of the live site** (superseded by `index.html`) and is intentionally excluded from this bundle.

## About the Design Files
These are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. Recreate the designs in the target codebase's environment (React/Next, Vue/Nuxt, Astro, SwiftUI, etc.) using its component patterns, routing, and asset pipeline. If no codebase exists, a static/SSG React or Astro stack suits a marketing site.

The `.dc.html` files are written for an in-house preview runtime (`support.js`). The **template markup lives between `<x-dc>` and `</x-dc>`**, and the **logic lives in a `class Component extends DCLogic { … }`** block. Read them as "markup + a small controller"; do not ship `support.js` or the `.dc.html` wrapper. The four particle/behavior modules (`knowhere-*.js`) are **plain vanilla JS with no dependencies** and can be ported or shipped largely as-is (see Assets).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and copy. Every visual value is spelled out literally in the prototypes' `<style>` blocks and inline styles — lift exact hex/rgba, radii, timings.

## Global Chrome (shared by all pages)

### Navigation
- Sticky (`fixed` on Home), `top:0`, `z-index:200`. Flex row, `gap:16px`, `padding:14px 34px`.
- Frosted glass: `backdrop-filter:blur(20px) saturate(150%)`, `background:rgba(7,7,8,0.62)`, `border-bottom:1px solid rgba(255,255,255,0.08)`.
- **Brand** (a link to `index.html` on every page): 30×30 mark slot with a **breathing radial green glow** behind it (`kwBreathe`/`kpBreathe` 3s: scale 1→1.35, opacity .5→.15) + the wordmark **know**​**here** (`here` bold), `16.5px`/`700`/`-0.04em`. The mark glyph runs a **slow brat-green color pulse** (`kwMarkPulse`/`kpMarkPulse` 4.2s: `#EDECE8`↔`#7BEA5A`); hovering the brand speeds the pulse to 1.6s and the glow to 1.2s.
- **Links** right-aligned, `gap:22px`, `13px`/`500`, `--dim`→`--ink` on hover; current page carries `.here`. Below `820px` non-CTA links hide.
- **CTA button**: brat-green `#7BEA5A` bg, ink text `#070708`, `border-radius:12px`, `padding:15px 28px`, `15px`/`700`. Perpetual soft glow (`kwCtaGlow` 3.2s) + diagonal sheen sweep (`kwSheen` 6s). Hover lifts `translateY(-1px)`. `.small` = `10px 18px`/`13px`, static shadow.

### Particle page-banner (`knowhere-particle-banner.js`)
Full-bleed `<canvas>` formation with the page title as a **frosted-glass overlay** (backdrop-blur masked to the title glyphs) floating over the particles.
- Markup per page: `<div class="page-banner"><div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div></div>`. JS injects the glass overlay as a sibling.
- Height `clamp(180px,28vh,320px)` (mobile `clamp(120px,20vh,190px)`), `max-width:1080px`, inset `0 34px`.
- API: `window.KnowhereParticleBanner(root, title, kind)` → returns a stop fn. **kind per page:**
  - How it works → `'layers'` (three counter-rotating rings — style × neurology × mode; a bright arc sweeps each).
  - For parents → `'heart'` (ECG trace + parametric heart; a pulse travels the line and the heart beats as it passes).
  - Pricing → `'chart'` (ascending bars breathe like an equalizer + a rising trend arrow; a pulse races up the line).
  - Experience it → `'modes'` (four orbs — see/hear/touch/talk — swirl on a wave; energy hops orb-to-orb).
- **Motion contract:** particles scatter, then ease into formation. A "come alive" ramp begins ~2.8s in and eases to full over ~1.6s (smoothstep), driving the per-kind secondary animation. Colors: warm base `#EDECE8`; accents brat `#7BEA5A`, purple `#9B5AEA`, blue `#23A4DD`. ~30fps cap; pauses offscreen; respects `prefers-reduced-motion`. DPR-capped 1.5.
- **Glass title:** blur `7px`, `saturate(160%)`, `brightness(1.28)`, faint tint from `rgba(237,236,232,0.12)`; masked to `900`-weight Geist glyphs, centered, inset `0 34px`. Intentionally sheer so the formation reads through the letters.

### Global footer (`knowhere-footer.js` → `<knowhere-footer-nav>`)
Sexy bookend, 1180px container.
- Two custom elements: `<knowhere-footer>` (Home's scroll-driven particle outro that assembles "nowhere" → "knowhere") and `<knowhere-footer-nav>` (shared nav/legal footer). Pages 2–5 mount `<knowhere-footer>` (it appends the nav footer after its outro); Home mounts `<knowhere-footer-nav>` directly after its own outro.
- Top border `1px solid rgba(123,234,90,0.14)`, bg `#070708` + green radial glow rising from the bottom (`radial-gradient(90% 130% at 50% 118%, rgba(123,234,90,0.10), transparent 60%)`). Container `padding:84px 34px 36px`.
- **Left block** (max 640px): kicker `no gatekeeping. iykyk.` (11px/700, `letter-spacing:0.26em`, `#6B6A66`), then tagline `clamp(32px,4.4vw,58px)`/`800`/`-0.045em`:
  > ready to claim your **unfair advantage**, or are we still pretending all-nighters work?

  "unfair advantage" uses the animated full-spectrum gradient (see Motion).
- **Right block**: a **breathing particle brandmark** on a 96px `<canvas>` (the logo sampled into particles that slowly scale-breathe, drift, twinkle, and cycle continuously through the full HSL spectrum — each particle carries its own hue offset, `hsla(hue,85%,64%)`), above the page links: **know us** (about → `know-us.html`), **mission** (→ `mission.html`), **talk to us** (contact → `talk-to-us.html`). Link style `15px`/`600`, `#9b9a96`→`#7BEA5A`. *These three destination pages do not exist yet — wire them to your routes; names are intentional (rename freely).*
- **Legal row** (below, `border-top:1px solid rgba(255,255,255,0.06)`, `margin-top:70px`): logo + `know`**here**, then right-aligned `privacy` · `terms of use` · `© 2026 knowhere` at `12px`, `#56554f`→`#8C8B87`. Legal targets: `privacy.html`, `terms.html`.

## Home page (bespoke) — key sequence
- **IYKYK banner:** a looping video (`uploads/iykyk-hero.mp4`) masked to the word "IYKYK". On scroll the text mask **disintegrates into scattering speckles** (per-block random death thresholds, downward drift) as the DOM copy fades and the particle cloud below takes over.
- Particles assemble the **knowhere** wordmark with a "k" that sweeps in (~half the scroll) followed by a green color wash.
- **"Your learning fingerprint"** section: three **left-aligned glass cards** in a 1180px container (card `border:0`, `width:688px`, `border-radius:26px`, `padding:48px 56px`; label `800`/uppercase colored per layer — your Style `#7BEA5A`, your Neurology `#9B5AEA`, your Mode `#23A4DD`; heading `clamp(24px,3.3vw,32px)`/`600`; body `clamp(18px,2.4vw,24px)`/`#9b9a96`). Sticky block is a fixed `100vh` centered column so a card lands at true vertical center; cards float in on a slow smootherstep ease, synced to their sibling particle formation.
- **Finale:** large headline `style × neurology × mode` with `=` beneath, then "the version of Year 12 that fits exactly one person.", then a big **You.** in the animated full-spectrum gradient. Ends with the kinetic finale + global footer.

## Interactions & Behavior
- **Reveal on scroll:** `[data-reveal]` starts `opacity:0; translateY(26px)` → visible over `.8s cubic-bezier(.2,.7,.2,1)` when an IntersectionObserver adds `.in` (`window.KnowherePage.reveal(root)`).
- **Logo injection:** `window.KnowherePage.injectLogo(root)` fills `[data-kw-logo]` slots with `KnowhereMarks.logoSvg(size, color)`. Home injects its nav/footer logos in `componentDidMount`.
- **Banner lifecycle:** started in `componentDidMount` after both `KnowherePage` and `KnowhereParticleBanner` exist (poll 50ms); returns a stop fn called on unmount.
- **Responsive:** nav links collapse below 820px; style grid below 760px; banner shrinks below 700px.
- **Reduced motion:** particle systems hold their assembled state; no come-alive/breathing.

## Motion / Animation reference (exact)
- `kwBreathe`/`kpBreathe` 3s — nav mark glow (scale 1→1.35, opacity .5→.15).
- `kwMarkPulse`/`kpMarkPulse` 4.2s — nav mark color `#EDECE8`↔`#7BEA5A` (hover 1.6s; glow hover 1.2s).
- `kwCtaGlow` 3.2s — CTA box-shadow `rgba(123,234,90,.2)`→`.4`.
- `kwSheen` 6s — CTA diagonal light sweep.
- `kwScroll`/`kpHint` ~2.4–2.6s — scroll-cue bounce.
- **Full-spectrum gradient text** (footer tagline, `You.`, `kwExpDrift`/`kpDrift`/`.irid`): `linear-gradient(...F15524,FCB815,7BEA5A,23A4DD,854896,EC1559,F15524)`, **`background-size:200% 100%`**, clipped to text, animated `background-position:0%→200%` over 7–9s `linear` ∞. **The first and last stops are identical and the size is exactly `200%`, so the loop shifts by exactly one tile period and is seamless (no jump). Preserve this pairing when porting.**

## Design Tokens
- **Backgrounds:** page `#070708` / `#08090B`; surfaces `rgba(255,255,255,0.018–0.05)`.
- **Text:** `--ink:#EDECE8`, `--dim:#8C8B87`, `--dimmer:#6B6A66`; body `#9b9a96`; faint legal `#56554f`.
- **Accents:** brat green `#7BEA5A`, neuro purple `#9B5AEA`, mode blue `#23A4DD`. Spectrum stops: `#F15524 #FCB815 #7BEA5A #23A4DD #854896 #EC1559`.
- **Lines:** `rgba(255,255,255,0.08)`; footer top `rgba(123,234,90,0.14)`.
- **Radius:** buttons `12px`; chips `13px`; footer/landing cards `18–26px`.
- **Type:** **Geist** (300–900) via Google Fonts; system-ui fallback. Headings `-0.04em`/`-0.045em`.
- **Layout:** content max-width `1080px` (pages) / `1180px` (footer & Home cards); gutter `34px`; section rhythm `64px`.
- **Texture:** fixed fractal-noise SVG overlay at `opacity:.035` for grain.

## Assets
- **`knowhere-marks.js`** — vanilla JS, no deps. `window.KnowhereMarks.logoSvg(size, color)` returns the wordmark logo as SVG; `.mount(root)`, `.colors`. Ship/port as-is.
- **`knowhere-page.js`** — vanilla JS. `injectLogo(root)` + `reveal(root)`. Port the two behaviors into your framework's idioms.
- **`knowhere-particle-banner.js`** — vanilla JS. `KnowhereParticleBanner(root, title, kind)`; needs a `#pbHost`/`#pbCv` pair + Geist loaded for the glass mask. Portable as-is.
- **`knowhere-footer.js`** — vanilla JS. Registers `<knowhere-footer>` + `<knowhere-footer-nav>`; depends on `KnowhereMarks.logoSvg`. Contains the scroll-outro particle system and the shared footer markup/links.
- **`uploads/iykyk-hero.mp4`** — the video shown through the "IYKYK" text mask on Home.
- **Fonts** — Geist via Google Fonts (`wght@300..900`). No emoji.
- **Logo** — generated as SVG by `KnowhereMarks.logoSvg`. For production, consider a hosted static SVG.

## Files
- `index.html`, `how-it-works.html`, `for-parents.html`, `pricing.html`, `experience-it.html` — the five live page prototypes (template + logic). Source of truth for layout, styles, motion, copy.
- `knowhere-marks.js`, `knowhere-page.js`, `knowhere-particle-banner.js`, `knowhere-footer.js` — shared vanilla-JS modules (ship/port these).
- `uploads/iykyk-hero.mp4` — Home banner video.
- `support.js` — in-house preview runtime. **Reference only — do not ship.** Included so you can open a prototype locally.

To view a prototype, open any `Knowhere *.dc.html` in a browser (it loads `support.js` + the `knowhere-*.js` modules from the same folder). Scroll to the bottom of any page for the global footer.
