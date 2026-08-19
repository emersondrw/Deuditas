import { useState, useMemo } from "react"
import type { DebtEntry } from "../types"
import { formatCurrency, getDebtStatus } from "../utils/format"

interface Props {
  entries: DebtEntry[]
  currency?: string
}

export function SummaryBar({ entries, currency = "PEN" }: Props) {
  const [selectedTabCurrency, setSelectedTabCurrency] = useState<string | null>(null)
  const activos = entries.filter(e => e.status === "activo")

  const summariesByCurrency = useMemo(() => {
    const map: Record<string, { totalDebo: number; totalMeDeben: number; count: number }> = {}

    for (const e of activos) {
      const curr = (e.currency || currency).toUpperCase()
      if (!map[curr]) {
        map[curr] = { totalDebo: 0, totalMeDeben: 0, count: 0 }
      }
      const { isOwed, displayAmount } = getDebtStatus(e)
      if (isOwed) {
        map[curr].totalMeDeben += displayAmount
      } else {
        map[curr].totalDebo += displayAmount
      }
      map[curr].count += 1
    }

    const keys = Object.keys(map)
    if (keys.length === 0) {
      return [{
        currency: currency.toUpperCase(),
        totalDebo: 0,
        totalMeDeben: 0,
        diff: 0,
        count: 0,
      }]
    }

    return keys.map(k => ({
      currency: k,
      totalDebo: map[k].totalDebo,
      totalMeDeben: map[k].totalMeDeben,
      diff: map[k].totalMeDeben - map[k].totalDebo,
      count: map[k].count,
    }))
  }, [activos, currency])

  const activeCurrency = useMemo(() => {
    if (selectedTabCurrency && summariesByCurrency.some(s => s.currency === selectedTabCurrency)) {
      return selectedTabCurrency
    }
    const defaultMatch = summariesByCurrency.find(s => s.currency === currency.toUpperCase())
    return defaultMatch ? defaultMatch.currency : summariesByCurrency[0].currency
  }, [selectedTabCurrency, summariesByCurrency, currency])

  const currentSummary = useMemo(() => {
    return summariesByCurrency.find(s => s.currency === activeCurrency) || summariesByCurrency[0]
  }, [summariesByCurrency, activeCurrency])

  const hasMultipleCurrencies = summariesByCurrency.length > 1

  return (
    <div className="mb-8">
      {hasMultipleCurrencies && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body mr-1 shrink-0">
            Moneda:
          </span>
          {summariesByCurrency.map(s => {
            const isSelected = s.currency === activeCurrency
            return (
              <button
                key={s.currency}
                onClick={() => setSelectedTabCurrency(s.currency)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-accent-owed/20 text-accent-owed border border-accent-owed/40 font-semibold"
                    : "bg-[#181818] text-text-secondary border border-border-custom hover:text-white hover:bg-[#222]"
                }`}
              >
                <span>{s.currency}</span>
                <span className="text-[10px] opacity-70">({s.count})</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owe">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owe/70 font-body">Debo</p>
            {hasMultipleCurrencies && (
              <span className="text-[10px] font-mono text-text-secondary">{activeCurrency}</span>
            )}
          </div>
          <p className="text-2xl font-mono font-semibold text-accent-owe tabular-nums leading-none">
            {formatCurrency(currentSummary.totalDebo, activeCurrency)}
          </p>
        </div>
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owed">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owed/70 font-body">Me deben</p>
            {hasMultipleCurrencies && (
              <span className="text-[10px] font-mono text-text-secondary">{activeCurrency}</span>
            )}
          </div>
          <p className="text-2xl font-mono font-semibold text-accent-owed tabular-nums leading-none">
            {formatCurrency(currentSummary.totalMeDeben, activeCurrency)}
          </p>
        </div>
      </div>

      <div className="mt-3 ledger-card rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body">
            Balance neto {hasMultipleCurrencies && <span className="font-mono text-white/70">({activeCurrency})</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-4 w-px bg-border-custom" />
            <p className={`font-mono font-semibold text-base tabular-nums ${currentSummary.diff >= 0 ? "text-accent-owed" : "text-accent-owe"}`}>
              {currentSummary.diff >= 0 ? "+" : ""}{formatCurrency(currentSummary.diff, activeCurrency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
