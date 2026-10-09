# DESIGN.md — Cairn Design System: STRATA

> A tangible, geological design language for cryptographic time-stamping, priority claims, and decentralized provenance on Monad.

---

## 1. Visual Identity & Metaphor

- **Concept:** Time is geological sediment. Each document claim forms a bedrock foundation stone. Each subsequent attestation or endorsement forms an interlocking stone layer resting above it.
- **Physicality:** Chiseled stone profiles, hairline fractures, mineral strata lines, subtle micro-haptics.
- **Tone:** Cryptographic, sober, authoritative, editorial. Zero web3 meme aesthetics.

---

## 2. Color System

```css
:root {
  /* Bedrock & Cavities */
  --color-bedrock: #08090B;          /* Canvas deepest black */
  --color-graphite-950: #0D0E12;     /* Surface layer 1 */
  --color-graphite-900: #14161C;     /* Surface layer 2 */
  --color-graphite-800: #1C1F27;     /* Hover surface */
  --color-graphite-700: #262A34;     /* Raised elements */

  /* Hairlines & Grid */
  --color-hairline: rgba(255, 255, 255, 0.08);
  --color-hairline-bright: rgba(255, 255, 255, 0.16);

  /* Strata Typography */
  --color-stone-warm-100: #F4F2EC;   /* Headings, focal points */
  --color-stone-warm-200: #E6E4DD;   /* Primary body */
  --color-stone-warm-400: #A8A69E;   /* Secondary descriptive text */
  --color-stone-cold-400: #8A94A6;   /* Labels, captions, metadata */
  --color-stone-cold-600: #555E70;   /* Muted icons, dividers */

  /* Semantic Accents */
  --color-ochre-primary: #D97736;    /* Commit action, priority seal, primary button */
  --color-ochre-glow: rgba(217, 119, 54, 0.15);
  --color-lichen-green: #22C55E;     /* Authentic verdict, verified claim */
  --color-crimson-alert: #EF4444;    /* Front-run detected, signature error */
}
```

---

## 3. Typography Hierarchy

| Role | Font Family | Weight | Size / Leading | Case / Tracking |
|---|---|---|---|---|
| **Monument Hero** | Newsreader | Regular / Italic | 52px / 1.1 | Normal / -0.02em |
| **Section Editorial** | Newsreader | Medium | 32px / 1.2 | Normal / -0.015em |
| **Card / Step Title** | Newsreader | Medium | 20px / 1.3 | Normal / 0 |
| **Body Standard** | Albert Sans | Regular | 14px / 1.6 | Normal / 0 |
| **Body Technical** | Albert Sans | Medium | 13px / 1.5 | Normal / 0.01em |
| **Cryptographic Hash** | IBM Plex Mono | Regular | 12px / 1.4 | Lowercase / 0.02em (tabular) |
| **Timestamp / Nonce** | IBM Plex Mono | Medium | 11px / 1.4 | Uppercase / 0.05em (tabular) |

---

## 4. Component Standards

### The Stone (`<Stone />`)
- 8 hand-tuned SVG path contours based on real glacial till and shale formations.
- Deterministic hash derivation: bytes from SHA-256 seed stone width, tilt (`-3°` to `+3°`), strata fissures, and mineral inclusions.
- Spring physics on placement: `stiffness: 260`, `damping: 24`, settling with soft ripple.

### The Tactile Dropzone (`<Dropzone />`)
- Border: 1px hairline dashed (`border-dashed border-stone-cold-600/40`).
- Drag-over state: hairline switches to ochre with subtle mineral amber inset gradient.
- Processing state: animated cryptographic byte counter with streaming hash progress.

### Buttons (`<Button />`)
- Primary: Ochre solid (`#D97736`) with black crisp text (`#0D0E12`), font-medium, rounded-sm, hairline inner border.
- Secondary: Graphite-900 surface with 1px hairline border, hover: graphite-800.
- Ghost: Transparent with stone-warm-400 text, hover: stone-warm-100.

### Hash Chip (`<HashChip />`)
- Truncated display (`0x3f2a...891c`) with 1-click copy to clipboard.
- Copy feedback: temporary green check with audio haptic tick.
- Direct external link icon to MonadScan (`testnet.monadscan.com`).

---

## 5. Micro-Interactions & Web Audio Haptics

Cairn features an optional, high-craft Web Audio haptic engine:
- **Stone Settle:** Low-frequency 70Hz mineral thud (`sine` oscillator, 60ms decay).
- **Commit Sealed:** 440Hz warm resonant chime (`triangle` oscillator, 120ms decay).
- **Hash Copied:** Crisp 1200Hz tick (`sine`, 25ms decay).
- Audio is muted by default or toggled cleanly in the navigation bar.
