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
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="glass rounded-2xl p-4 border border-red-500/20">
        <p className="text-xs uppercase tracking-widest text-red-400/70 mb-1">Debo</p>
        <p className="text-2xl font-bold text-red-400">{formatCurrency(totalDebo)}</p>
      </div>
      <div className="glass rounded-2xl p-4 border border-green-500/20">
        <p className="text-xs uppercase tracking-widest text-green-400/70 mb-1">Me deben</p>
        <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMeDeben)}</p>
      </div>
      <div className="col-span-2 glass rounded-2xl p-3 border border-neutral-500/20 text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-0.5">Balance neto</p>
        <p className={`text-lg font-semibold ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
          {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
        </p>
      </div>
    </div>
  )
}
