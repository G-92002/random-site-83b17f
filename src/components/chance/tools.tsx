import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Copy, Dices, Minus, Plus, RotateCcw, Shuffle } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import {
  ORACLE_ANSWERS,
  isLight,
  pick,
  randomHex,
  randomInt,
  shuffle,
} from '@/lib/random'

export type ToolProps = {
  /** Bumped by the parent's "Surprise me" button to run this tool remotely. */
  trigger: number
  onResult: (outcome: string) => void
}

/** Runs `fn` whenever `trigger` increases past zero. */
function useRemoteTrigger(trigger: number, fn: () => void) {
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  })
  useEffect(() => {
    if (trigger > 0) fnRef.current()
  }, [trigger])
}

export function ToolCard({
  id,
  title,
  kicker,
  tone,
  children,
  className,
}: {
  id: string
  title: string
  kicker: string
  tone: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'ink-card flex flex-col overflow-hidden scroll-mt-6',
        className,
      )}
    >
      <header
        className="flex items-baseline justify-between gap-3 border-b-2 border-border px-5 py-3"
        style={{ background: tone }}
      >
        <h2 id={`${id}-title`} className="font-display text-xl font-extrabold">
          {title}
        </h2>
        <span className="font-number text-xs uppercase tracking-widest">
          {kicker}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-5 p-5">{children}</div>
    </section>
  )
}

/* ---------------------------------- Dice ---------------------------------- */

const DIE_SIDES = [4, 6, 8, 12, 20] as const
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Die({ value, sides }: { value: number; sides: number }) {
  if (sides === 6) {
    return (
      <div className="grid size-16 grid-cols-3 grid-rows-3 gap-1 rounded-xl border-2 border-border bg-card p-2 shadow-[3px_3px_0_0_var(--border)]">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'm-auto size-2.5 rounded-full',
              PIPS[value]?.includes(i) ? 'bg-foreground' : 'bg-transparent',
            )}
          />
        ))}
      </div>
    )
  }
  return (
    <div className="flex size-16 items-center justify-center rounded-xl border-2 border-border bg-card font-number text-2xl font-bold shadow-[3px_3px_0_0_var(--border)]">
      {value}
    </div>
  )
}

export function DiceTool({ trigger, onResult }: ToolProps) {
  const [count, setCount] = useState(2)
  const [sides, setSides] = useState<number>(6)
  const [values, setValues] = useState<number[]>([3, 5])
  const [spin, setSpin] = useState(0)

  const roll = () => {
    const next = Array.from({ length: count }, () => randomInt(1, sides))
    setValues(next)
    setSpin((s) => s + 1)
    const total = next.reduce((a, b) => a + b, 0)
    onResult(`Rolled ${count}d${sides}: ${next.join(' + ')} = ${total}`)
  }
  useRemoteTrigger(trigger, roll)

  const shown = values.slice(0, count)
  while (shown.length < count) shown.push(1)
  const total = shown.reduce((a, b) => a + b, 0)

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Die type"
      >
        {DIE_SIDES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSides(s)}
            aria-pressed={sides === s}
            className={cn(
              'rounded-lg border-2 border-border px-2.5 py-1 font-number text-sm font-bold transition-colors motion-reduce:transition-none',
              sides === s
                ? 'bg-foreground text-background'
                : 'bg-card hover:bg-muted',
            )}
          >
            d{s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Fewer dice"
            className="rounded-lg border-2 border-border bg-card p-1 hover:bg-muted disabled:opacity-40"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            disabled={count <= 1}
          >
            <Minus className="size-4" />
          </button>
          <span
            className="w-8 text-center font-number font-bold"
            aria-live="polite"
          >
            {count}
          </span>
          <button
            type="button"
            aria-label="More dice"
            className="rounded-lg border-2 border-border bg-card p-1 hover:bg-muted disabled:opacity-40"
            onClick={() => setCount((c) => Math.min(6, c + 1))}
            disabled={count >= 6}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div
        key={spin}
        className={cn(
          'flex min-h-36 flex-wrap items-center justify-center gap-3 rounded-xl bg-muted paper-dots p-4',
          spin > 0 && 'animate-tumble',
        )}
      >
        {shown.map((v, i) => (
          <Die key={i} value={v} sides={sides} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className="text-muted-foreground">
          Total{' '}
          <span
            className="font-number text-2xl font-bold text-foreground"
            aria-live="polite"
          >
            {total}
          </span>
        </p>
        <button
          type="button"
          onClick={roll}
          className="ink-button bg-accent text-accent-foreground"
        >
          <Dices className="size-5" /> Roll
        </button>
      </div>
    </>
  )
}

/* ---------------------------------- Coin ---------------------------------- */

export function CoinTool({ trigger, onResult }: ToolProps) {
  const [side, setSide] = useState<'Heads' | 'Tails'>('Heads')
  const [tally, setTally] = useState({ Heads: 0, Tails: 0 })
  const [spin, setSpin] = useState(0)

  const flip = () => {
    const next = randomInt(0, 1) === 0 ? 'Heads' : 'Tails'
    setSide(next)
    setTally((t) => ({ ...t, [next]: t[next] + 1 }))
    setSpin((s) => s + 1)
    onResult(`Flipped a coin: ${next}`)
  }
  useRemoteTrigger(trigger, flip)

  const flips = tally.Heads + tally.Tails

  return (
    <>
      <div className="flex min-h-36 items-center justify-center rounded-xl bg-muted paper-dots p-4 [perspective:600px]">
        <div
          key={spin}
          className={cn(
            'flex size-28 items-center justify-center rounded-full border-2 border-border font-display text-4xl font-extrabold shadow-[4px_4px_0_0_var(--border)]',
            spin > 0 && 'animate-coin',
            side === 'Heads' ? 'bg-chart-3' : 'bg-chart-2 text-background',
          )}
          aria-live="polite"
          aria-label={spin > 0 ? side : 'Coin, not yet flipped'}
        >
          {side === 'Heads' ? 'H' : 'T'}
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {(
          [
            ['Heads', tally.Heads],
            ['Tails', tally.Tails],
            ['Flips', flips],
          ] as const
        ).map(([label, n]) => (
          <div
            key={label}
            className="rounded-lg border-2 border-border bg-card py-1.5"
          >
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="font-number text-lg font-bold">{n}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setTally({ Heads: 0, Tails: 0 })}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline disabled:opacity-40"
          disabled={flips === 0}
        >
          <RotateCcw className="size-3.5" /> Reset tally
        </button>
        <button type="button" onClick={flip} className="ink-button bg-chart-3">
          Flip it
        </button>
      </div>
    </>
  )
}

/* --------------------------------- Number --------------------------------- */

export function NumberTool({ trigger, onResult }: ToolProps) {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [value, setValue] = useState<number | null>(null)
  const [spin, setSpin] = useState(0)

  const lo = Number.parseInt(min, 10)
  const hi = Number.parseInt(max, 10)
  const valid = Number.isFinite(lo) && Number.isFinite(hi)

  const draw = () => {
    if (!valid) {
      toast.error('Enter two whole numbers first.')
      return
    }
    const n = randomInt(lo, hi)
    setValue(n)
    setSpin((s) => s + 1)
    onResult(
      `Picked a number from ${Math.min(lo, hi)}–${Math.max(lo, hi)}: ${n}`,
    )
  }
  useRemoteTrigger(trigger, draw)

  const field =
    'w-full rounded-lg border-2 border-border bg-card px-3 py-2 font-number font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50'

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          From
          <input
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          To
          <input
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={field}
          />
        </label>
      </div>
      <div className="flex min-h-28 items-center justify-center rounded-xl bg-muted paper-dots">
        <span
          key={spin}
          className={cn(
            'font-number text-6xl font-bold',
            spin > 0 && 'animate-tumble',
            value === null && 'text-muted-foreground',
          )}
          aria-live="polite"
        >
          {value ?? '?'}
        </span>
      </div>
      <div className="mt-auto flex justify-end">
        <button
          type="button"
          onClick={draw}
          className="ink-button bg-chart-5 text-background"
        >
          Draw a number
        </button>
      </div>
    </>
  )
}

/* --------------------------------- Picker --------------------------------- */

export function PickerTool({ trigger, onResult }: ToolProps) {
  const [text, setText] = useState(
    'Tacos\nRamen\nPizza\nThat salad place\nCook at home',
  )
  const [winner, setWinner] = useState<string | null>(null)
  const [order, setOrder] = useState<string[] | null>(null)
  const [spin, setSpin] = useState(0)

  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const choose = () => {
    if (items.length < 2) {
      toast.error('Add at least two options, one per line.')
      return
    }
    const w = pick(items)
    setWinner(w)
    setOrder(null)
    setSpin((n) => n + 1)
    onResult(`Picked from ${items.length} options: ${w}`)
  }
  useRemoteTrigger(trigger, choose)

  const reorder = () => {
    if (items.length < 2) {
      toast.error('Add at least two options, one per line.')
      return
    }
    const s = shuffle(items)
    setOrder(s)
    setWinner(null)
    onResult(`Shuffled ${items.length} options: ${s.join(', ')}`)
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Options, one per line
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="resize-y rounded-lg border-2 border-border bg-card px-3 py-2 font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        />
      </label>
      <div
        className="min-h-20 rounded-xl bg-muted paper-dots p-4"
        aria-live="polite"
      >
        {winner && (
          <p className="text-center">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground">
              Fate chose
            </span>
            <span
              key={spin}
              className="inline-block animate-tumble font-display text-3xl font-extrabold"
            >
              {winner}
            </span>
          </p>
        )}
        {order && (
          <ol className="flex flex-wrap gap-2">
            {order.map((o, i) => (
              <li
                key={o + i}
                className="rounded-lg border-2 border-border bg-card px-2 py-0.5 text-sm font-semibold"
              >
                <span className="font-number text-muted-foreground">
                  {i + 1}.
                </span>{' '}
                {o}
              </li>
            ))}
          </ol>
        )}
        {!winner && !order && (
          <p className="text-center text-muted-foreground">
            {items.length} option{items.length === 1 ? '' : 's'} in the hat
          </p>
        )}
      </div>
      <div className="mt-auto flex flex-wrap justify-end gap-2">
        <button type="button" onClick={reorder} className="ink-button bg-card">
          <Shuffle className="size-4" /> Shuffle
        </button>
        <button
          type="button"
          onClick={choose}
          className="ink-button bg-chart-4 text-background"
        >
          Pick one
        </button>
      </div>
    </>
  )
}

/* --------------------------------- Colors --------------------------------- */

const STARTER_PALETTE = ['#ff6b3d', '#ffd23f', '#3bb59a', '#5468ff', '#2a2438']

export function ColorTool({ trigger, onResult }: ToolProps) {
  const [colors, setColors] = useState<string[]>(STARTER_PALETTE)

  const draw = () => {
    const next = Array.from({ length: 5 }, randomHex)
    setColors(next)
    onResult(`Drew a palette: ${next.join(' ')}`)
  }
  useRemoteTrigger(trigger, draw)

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      toast.success(`Copied ${hex}`)
    } catch {
      toast.error('Couldn’t copy to the clipboard.')
    }
  }

  return (
    <>
      <div className="flex min-h-44 overflow-hidden rounded-xl border-2 border-border">
        {colors.map((c, i) => (
          <button
            key={c + i}
            type="button"
            onClick={() => copy(c)}
            aria-label={`Copy ${c}`}
            className={cn(
              'group flex flex-1 flex-col items-center justify-end gap-1 pb-3 transition-[flex-grow] duration-200 hover:flex-[1.6] motion-reduce:transition-none',
              i > 0 && 'border-l-2 border-border',
              isLight(c) ? 'text-black' : 'text-white',
            )}
            style={{ background: c }}
          >
            <Copy className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            <span className="font-number text-[11px] font-bold uppercase sm:text-xs">
              {c}
            </span>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Tap any swatch to copy its hex code.
      </p>
      <div className="mt-auto flex justify-end">
        <button
          type="button"
          onClick={draw}
          className="ink-button bg-accent text-accent-foreground"
        >
          New palette
        </button>
      </div>
    </>
  )
}

/* --------------------------------- Oracle --------------------------------- */

export function OracleTool({ trigger, onResult }: ToolProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [spin, setSpin] = useState(0)

  const ask = () => {
    const a = pick(ORACLE_ANSWERS)
    setAnswer(a)
    setSpin((s) => s + 1)
    const q = question.trim()
    onResult(q ? `Asked “${q}” — ${a}` : `Consulted the oracle — ${a}`)
  }
  useRemoteTrigger(trigger, ask)

  return (
    <form
      className="flex flex-1 flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        ask()
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Your yes-or-no question
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Should I text them back?"
          className="rounded-lg border-2 border-border bg-card px-3 py-2 font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        />
      </label>
      <div className="flex min-h-36 items-center justify-center rounded-xl bg-foreground p-4">
        <div
          key={spin}
          className={cn(
            'flex size-32 items-center justify-center rounded-full border-4 border-chart-4 bg-[oklch(0.3_0.08_290)] p-4 text-center text-sm font-bold text-background',
            spin > 0 && 'animate-tumble',
          )}
          aria-live="polite"
        >
          {answer ?? <span className="font-display text-5xl">8</span>}
        </div>
      </div>
      <div className="mt-auto flex justify-end">
        <button type="submit" className="ink-button bg-chart-4 text-background">
          Ask the oracle
        </button>
      </div>
    </form>
  )
}
