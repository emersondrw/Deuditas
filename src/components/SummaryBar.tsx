import type { DebtEntry } from "../types"
import { formatCurrency, getDebtStatus } from "../utils/format"

interface Props {
  entries: DebtEntry[]
  currency?: string
}

export function SummaryBar({ entries, currency = "PEN" }: Props) {
  const activos = entries.filter(e => e.status === "activo")

  let totalDebo = 0
  let totalMeDeben = 0

  for (const e of activos) {
    const { isOwed, displayAmount } = getDebtStatus(e)
    if (isOwed) {
      totalMeDeben += displayAmount
    } else {
      totalDebo += displayAmount
    }
  }

  const diff = totalMeDeben - totalDebo

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owe">
          <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owe/70 mb-1.5 font-body">Debo</p>
          <p className="text-2xl font-mono font-semibold text-accent-owe tabular-nums leading-none">{formatCurrency(totalDebo, currency)}</p>
        </div>
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owed">
          <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owed/70 mb-1.5 font-body">Me deben</p>
          <p className="text-2xl font-mono font-semibold text-accent-owed tabular-nums leading-none">{formatCurrency(totalMeDeben, currency)}</p>
        </div>
      </div>
      <div className="mt-3 ledger-card rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body">Balance neto</p>
          <div className="flex items-center gap-2">
            <span className="h-4 w-px bg-border-custom" />
            <p className={`font-mono font-semibold text-base tabular-nums ${diff >= 0 ? "text-accent-owed" : "text-accent-owe"}`}>
              {diff >= 0 ? "+" : ""}{formatCurrency(diff, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
