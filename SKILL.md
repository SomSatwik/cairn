---
name: design-taste
description: Elite UI/UX design craft, anti-slop rules, Vercel web guidelines, STRATA design system, and Playwright verification for Cairn.
metadata:
  author: cairn
  version: "2.0.0"
  variance: 9
  motion: 8
  density: 8
---

# Design Taste & High-Craft Web Interface Specification

Synthesized from:
- **Leonxlnx/taste-skill** (Brief inference, anti-slop doctrine, variance/motion/density dials)
- **Vercel Web Interface Guidelines** (Accessibility AA/AAA, kinetic polish, state completeness, tabular data, zero layout shift)
- **VoltAgent Awesome-Design-MD** (Physical material design tokens, typography ramps, editorial layouts)
- **Playwright Agent-CLI Standards** (Accessible snapshot testing, deterministic interaction loops)

---

## 1. The Anti-Slop Doctrine

### Banned Elements (Zero Tolerance)
- ❌ **No generic purple-indigo gradients** or rainbow mesh blur blobs.
- ❌ **No cookie-cutter 3-card icon grids** with standard Lucide boxes.
- ❌ **No default Tailwind rounded-2xl bubbly borders** with heavy blurred box-shadows.
- ❌ **No marketing fluff** ("revolutionary", "seamless", "next-gen AI", "game-changing").
- ❌ **No fake testimonials or invented stats**.
- ❌ **No floating decorative shapes** without functional meaning.

### Mandated Craft Principles
- ✅ **Physical Metaphor (STRATA):** Time is sediment. Documents are foundation stones. Attestations are stacked cairn layers. Every visual element has geological weight, mass, and texture.
- ✅ **Hash-Seeded Determinism:** Every document hash deterministically generates its visual identity (stone contours, fissures, offsets, and hues).
- ✅ **Tactile Micro-Interactions:** Subtle audio feedback via Web Audio API synthesizer clicks when stones settle, buttons click, or hashes copy.
- ✅ **Hairline Elevation:** 1px borders (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.16)`) instead of drop shadows. Inset hairline highlights.
- ✅ **Real State Coverage:** Every interactive element has explicit `:hover`, `:active`, `:focus-visible`, `:disabled`, `loading`, `empty`, and `error` states.

---

## 2. Design Dials

| Parameter | Setting | Rationale |
|---|---|---|
| `DESIGN_VARIANCE` | **9 / 10** | High bespoke distinctiveness. Bespoke SVG stone generators, asymmetrical editorial layout, monolithic branding. |
| `MOTION_INTENSITY` | **8 / 10** | Fluid spring physics for stone stacking, interactive cursor parallax, page-level transitions, respects `prefers-reduced-motion`. |
| `VISUAL_DENSITY` | **8 / 10** | High information density suitable for cryptographic forensic proof tools without clutter. Tabular data, strict monospace numerals. |

---

## 3. STRATA Design Tokens (`DESIGN.md` Alignment)

### Color Palette
- **Bedrock / Canvas:** `#08090B` (deep mineral obsidian)
- **Graphite Trench:** `#0D0E12` (card background)
- **Graphite Surface:** `#14161C` (elevated surface)
- **Graphite Interactive:** `#1C1F27` (hover surface)
- **Hairline Border:** `rgba(255, 255, 255, 0.07)`
- **Hairline Active:** `rgba(255, 255, 255, 0.15)`
- **Stone Cold:** `#8A94A6` (secondary technical text)
- **Stone Warm:** `#E6E4DD` (primary typography, off-white calcified chalk)
- **Ochre Ember:** `#D97736` (accent action, priority seal, Monad energy)
- **Verdant Lichen:** `#22C55E` (authentic verified state)
- **Crimson Fissure:** `#EF4444` (mempool front-run or invalid reveal alert)

### Typography Ramp
- **Display / Editorial:** *Newsreader* (Serif, font-normal / italic for manifesto statements)
- **Functional Body:** *Albert Sans* (Crisp modern grotesque, high legibility at 12–15px)
- **Cryptographic Monospace:** *IBM Plex Mono* (Hashes, timestamps, nonces, addresses, tabular data)

---

## 4. Vercel Web Interface Compliance Checklist

1. **Accessibility (WCAG 2.1 AA/AAA):**
   - High contrast text (`#E6E4DD` on `#08090B` = > 13:1 ratio).
   - All interactive controls have visible focus rings (`focus-visible:ring-1 focus-visible:ring-ochre/60`).
   - Form controls have associated labels, error announcements via ARIA.
2. **Typography & Layout:**
   - Tabular figures (`font-variant-numeric: tabular-nums`) on all numbers, times, and hashes.
   - Text wrapped with `break-all` on cryptographic digests.
3. **Motion:**
   - CSS & Motion properties restricted to `transform` and `opacity` to maintain locked 60fps.
   - `prefers-reduced-motion` media query fallbacks for instant settling.
4. **Performance:**
   - Zero cumulative layout shift (CLS) — SVGs, columns, and dropzones have fixed aspect bounds.
   - Local Web Crypto SHA-256 offloaded to Web Worker.

---

## 5. Playwright Agent-CLI Testing & Verification Protocol

When validating with browser automation (using Brave Browser at `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`):
1. **Accessibility Tree Snapshot:** Verify elements have unambiguous roles (`role="button"`, `role="tab"`, `aria-label`).
2. **User Journeys:**
   - Home: Cairn column renders deterministically, sample switcher updates the stack smoothly.
   - Claim: Drop local document -> hash computes locally -> phase 1 commit -> phase 2 reveal -> confirmation state.
   - Verify: Query by hash -> onchain data loads -> attestation form submits -> new layer appears on top of column.
   - Judge Mode: Navbar toggle generates ephemeral key -> simulated gasless relayer executes.
