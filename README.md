# Pure Chance

A playful one-page toolkit for letting fate decide. Pure Chance bundles six randomizers into one page:

- **Dice**: roll 1–6 dice of any type (d4, d6, d8, d12, d20) and get a running total.
- **Coin**: flip a coin and keep a heads/tails tally.
- **The Hat**: paste a list of options, then pick one or shuffle the whole list.
- **Number**: draw a whole number from any range.
- **Oracle**: ask a yes-or-no question and get an answer, magic 8-ball style.
- **Palette**: draw five random colors and tap a swatch to copy its hex code.

A **Surprise me** button runs a random tool for you, and **Fate's ledger** keeps a log of the last dozen outcomes.

All randomness comes from the browser's `crypto.getRandomValues` and uses rejection sampling, so results are fair and free of bias. Everything runs on the visitor's device. There is no backend and nothing gets stored.

## Tech

- TanStack Start (React 19, TanStack Router) on Vite
- Tailwind CSS 4 with theme variables in `src/styles.css`
- lucide-react icons and sonner toasts
- Deployed on Netlify

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
# or, with Netlify emulation:
netlify dev
```
