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
        glass rounded-2xl p-4 mb-3 transition-all duration-300
        ${entry.status === "pagado" ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onOpenDetail(entry.id)}
            className="text-left w-full"
          >
            <h3
              className={`
                text-lg font-semibold truncate
                ${entry.status === "pagado" ? "line-through" : ""}
                ${isOwed ? "text-green-400" : "text-red-400"}
              `}
            >
              {entry.name}
            </h3>
            <p
              className={`
                text-sm mt-0.5
                ${entry.status === "pagado" ? "line-through text-neutral-500" : "text-neutral-300"}
              `}
            >
              {isOwed ? "Te debe" : "Le debes"} —{" "}
              <span className={isOwed ? "text-green-400" : "text-red-400"}>
                {formatCurrency(entry.amount)}
              </span>
            </p>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`
              inline-block w-2.5 h-2.5 rounded-full
              ${isOwed ? "bg-green-400" : "bg-red-400"}
            `}
          />
          <button
            onClick={() => onOpenDetail(entry.id)}
            className="text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          >
            Detalle
          </button>
          <button
            onClick={() => onTogglePaid(entry.id)}
            className={`
              text-xs px-2 py-1 rounded-lg transition-colors
              ${entry.status === "pagado"
                ? "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
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
