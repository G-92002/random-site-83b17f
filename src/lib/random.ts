// Cryptographically strong randomness so every roll is a fair one.

/** Uniform integer in [min, max], inclusive, without modulo bias. */
export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  const range = hi - lo + 1
  if (range <= 1) return lo
  const limit = Math.floor(0x100000000 / range) * range
  const buf = new Uint32Array(1)
  let n: number
  do {
    crypto.getRandomValues(buf)
    n = buf[0]
  } while (n >= limit)
  return lo + (n % range)
}

export function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function randomHex(): string {
  return (
    '#' +
    Array.from({ length: 3 }, () =>
      randomInt(0, 255).toString(16).padStart(2, '0'),
    ).join('')
  )
}

/** Perceived brightness, used to choose readable text over a swatch. */
export function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
}

export const ORACLE_ANSWERS = [
  'Absolutely, yes.',
  'The stars say go.',
  'Without a doubt.',
  'Signs point to yes.',
  'Lean in. Yes.',
  'Ask again after snacks.',
  'Too foggy to tell.',
  'Flip a coin. Oh wait.',
  'Not today.',
  'Hard no.',
  'The dice frown upon it.',
  'Very doubtful.',
] as const
