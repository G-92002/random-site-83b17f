import { useState } from 'react'
import type { ComponentType } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Sparkles, Trash2 } from 'lucide-react'

import {
  CoinTool,
  ColorTool,
  DiceTool,
  NumberTool,
  OracleTool,
  PickerTool,
  ToolCard,
} from '@/components/chance/tools'
import type { ToolProps } from '@/components/chance/tools'
import { randomInt } from '@/lib/random'

export const Route = createFileRoute('/')({
  component: Home,
})

type Tool = {
  id: string
  title: string
  kicker: string
  tone: string
  Component: ComponentType<ToolProps>
  className?: string
}

const TOOLS: Tool[] = [
  {
    id: 'dice',
    title: 'Dice',
    kicker: 'd4 → d20',
    tone: 'var(--chart-1)',
    Component: DiceTool,
    className: 'lg:col-span-2',
  },
  {
    id: 'coin',
    title: 'Coin',
    kicker: '50 / 50',
    tone: 'var(--chart-3)',
    Component: CoinTool,
  },
  {
    id: 'picker',
    title: 'The Hat',
    kicker: 'pick · shuffle',
    tone: 'var(--chart-4)',
    Component: PickerTool,
  },
  {
    id: 'number',
    title: 'Number',
    kicker: 'any range',
    tone: 'var(--chart-5)',
    Component: NumberTool,
  },
  {
    id: 'oracle',
    title: 'Oracle',
    kicker: 'yes / no',
    tone: 'var(--chart-2)',
    Component: OracleTool,
  },
  {
    id: 'color',
    title: 'Palette',
    kicker: '5 swatches',
    tone: 'var(--chart-1)',
    Component: ColorTool,
    className: 'md:col-span-2 lg:col-span-3',
  },
]

type LogEntry = { id: number; tool: string; outcome: string }

const MAX_LOG = 12

function Home() {
  const [triggers, setTriggers] = useState<Record<string, number>>({})
  const [log, setLog] = useState<LogEntry[]>([])

  const record = (tool: string) => (outcome: string) =>
    setLog((l) =>
      [{ id: (l[0]?.id ?? 0) + 1, tool, outcome }, ...l].slice(0, MAX_LOG),
    )

  const surprise = () => {
    const tool = TOOLS[randomInt(0, TOOLS.length - 1)]
    setTriggers((t) => ({ ...t, [tool.id]: (t[tool.id] ?? 0) + 1 }))
    document
      .getElementById(tool.id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="min-h-screen paper-dots">
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-5 sm:px-6">
        <a
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg border-2 border-border bg-accent text-accent-foreground shadow-[2px_2px_0_0_var(--border)]"
          >
            ⚄
          </span>
          Pure Chance
        </a>
        <nav
          aria-label="Tools"
          className="hidden gap-4 text-sm font-semibold md:flex"
        >
          {TOOLS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="underline-offset-4 hover:underline"
            >
              {t.title}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-content px-4 pb-16 sm:px-6">
        <section className="grid items-center gap-8 py-10 md:grid-cols-[1.3fr_1fr] md:py-16">
          <div>
            <p className="mb-4 inline-block rounded-full border-2 border-border bg-card px-3 py-1 font-number text-xs font-bold uppercase tracking-widest">
              Six ways to stop deciding
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              Let fate{' '}
              <span className="relative inline-block -rotate-2 rounded-xl border-2 border-border bg-accent px-3 text-accent-foreground shadow-[5px_5px_0_0_var(--border)]">
                decide.
              </span>
            </h1>
            <p className="mt-6 max-w-reading text-lg text-muted-foreground sm:text-xl">
              Roll dice, flip coins, pull names from a hat, draw a fresh color
              palette, or ask the oracle. Every result is truly random, courtesy
              of your browser’s cryptographic dice.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={surprise}
                className="ink-button bg-foreground px-6 py-3 text-lg text-background"
              >
                <Sparkles className="size-5" /> Surprise me
              </button>
              <a href="#dice" className="ink-button bg-card">
                Browse the tools
              </a>
            </div>
          </div>

          <aside
            aria-labelledby="log-title"
            className="ink-card flex max-h-80 flex-col"
          >
            <div className="flex items-center justify-between border-b-2 border-border px-4 py-2.5">
              <h2 id="log-title" className="font-display font-extrabold">
                Fate’s ledger
              </h2>
              <button
                type="button"
                onClick={() => setLog([])}
                disabled={log.length === 0}
                aria-label="Clear the ledger"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {log.length === 0 ? (
              <p className="flex flex-1 items-center justify-center px-6 py-10 text-center text-muted-foreground">
                Nothing decided yet. Hit{' '}
                <strong className="mx-1 text-foreground">Surprise me</strong> or
                use any tool below.
              </p>
            ) : (
              <ol
                className="flex-1 divide-y-2 divide-dashed divide-border/20 overflow-y-auto"
                aria-live="polite"
              >
                {log.map((e) => (
                  <li key={e.id} className="flex gap-3 px-4 py-2 text-sm">
                    <span className="w-14 shrink-0 font-number text-xs font-bold uppercase text-muted-foreground">
                      {e.tool}
                    </span>
                    <span className="font-medium">{e.outcome}</span>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ Component, ...t }) => (
            <ToolCard key={t.id} {...t}>
              <Component
                trigger={triggers[t.id] ?? 0}
                onResult={record(t.title)}
              />
            </ToolCard>
          ))}
        </div>
      </main>

      <footer className="border-t-2 border-border bg-card">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span className="font-display font-extrabold text-foreground">
            Pure Chance
          </span>
          <span>Results are generated on your device and never leave it.</span>
        </div>
      </footer>
    </div>
  )
}
