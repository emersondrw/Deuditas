import type { DebtEntry } from "../types"
import { formatCurrency } from "../utils/format"

interface Props {
  entries: DebtEntry[]
}

export function SummaryBar({ entries }: Props) {
  const activos = entries.filter(e => e.status === "activo")

  const totalDebo = activos
    .filter(e => e.type === "debo")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalMeDeben = activos
    .filter(e => e.type === "me-deben")
    .reduce((sum, e) => sum + e.amount, 0)

  const diff = totalMeDeben - totalDebo

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owe">
          <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owe/70 mb-1.5 font-body">Debo</p>
          <p className="text-2xl font-mono font-semibold text-accent-owe tabular-nums leading-none">{formatCurrency(totalDebo)}</p>
        </div>
        <div className="ledger-card rounded-lg p-4 border-l-2 border-l-accent-owed">
          <p className="text-[11px] uppercase tracking-[0.15em] text-accent-owed/70 mb-1.5 font-body">Me deben</p>
          <p className="text-2xl font-mono font-semibold text-accent-owed tabular-nums leading-none">{formatCurrency(totalMeDeben)}</p>
        </div>
      </div>
      <div className="mt-3 ledger-card rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body">Balance neto</p>
          <div className="flex items-center gap-2">
            <span className="h-4 w-px bg-border-custom" />
            <p className={`font-mono font-semibold text-base tabular-nums ${diff >= 0 ? "text-accent-owed" : "text-accent-owe"}`}>
              {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
