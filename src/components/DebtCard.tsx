import type { DebtEntry } from "../types"
import { formatCurrency } from "../utils/format"

interface Props {
  entry: DebtEntry
  onTogglePaid: (id: string) => void
  onOpenDetail: (id: string) => void
}

export function DebtCard({ entry, onTogglePaid, onOpenDetail }: Props) {
  const isOwed = entry.type === "me-deben"

  return (
    <div
      className={`
        ledger-card rounded-lg p-4 mb-2.5 transition-all duration-300
        ${entry.status === "pagado" ? "opacity-40" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenDetail(entry.id)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${isOwed ? "bg-accent-owed" : "bg-accent-owe"}`}
            />
            <h3
              className={`
                font-body font-medium text-sm truncate
                ${entry.status === "pagado" ? "line-through text-text-secondary" : "text-white"}
              `}
            >
              {entry.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 ml-[18px]">
            <p className="text-[11px] text-text-secondary font-body">
              {isOwed ? "Te debe" : "Le debes"}
            </p>
            <span className="text-border-custom text-[10px]">/</span>
            <p className={`font-mono text-sm font-semibold tabular-nums ${isOwed ? "text-accent-owed" : "text-accent-owe"}`}>
              {formatCurrency(entry.amount)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenDetail(entry.id)}
            className="text-[11px] text-text-secondary hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-surface-hover font-body"
          >
            Detalle
          </button>
          <button
            onClick={() => onTogglePaid(entry.id)}
            className={`
              text-[11px] px-2 py-1 rounded-md transition-colors font-body
              ${entry.status === "pagado"
                ? "text-text-secondary hover:text-white hover:bg-surface-hover"
                : "text-text-secondary hover:text-white hover:bg-surface-hover"
              }
            `}
          >
            {entry.status === "pagado" ? "Reabrir" : "Pagado"}
          </button>
        </div>
      </div>
    </div>
  )
}
