import type { DebtEntry } from "../types"
import { formatCurrency, getDebtStatus, getDueDateStatus } from "../utils/format"
import { getCategoryInfo } from "../utils/categories"

interface Props {
  entry: DebtEntry
  currency?: string
  onTogglePaid: (id: string) => void
  onOpenDetail: (id: string) => void
}

export function DebtCard({ entry, currency = "PEN", onTogglePaid, onOpenDetail }: Props) {
  const { displayAmount, label, colorClass, bgClass } = getDebtStatus(entry)
  const entryCurrency = entry.currency || currency
  const category = getCategoryInfo(entry.category)
  const dueInfo = getDueDateStatus(entry.dueDate)
  const isPaid = entry.status === "pagado"

  return (
    <div
      className={`
        ledger-card rounded-lg p-4 mb-2.5 transition-all duration-300
        ${isPaid ? "opacity-40" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenDetail(entry.id)}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${bgClass}`}
            />
            <span className="text-xs shrink-0" title={category.name}>{category.icon}</span>
            <h3
              className={`
                font-body font-medium text-sm truncate
                ${isPaid ? "line-through text-text-secondary" : "text-white"}
              `}
            >
              {entry.name}
            </h3>
            {entry.currency && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#202020] text-text-secondary border border-border-custom shrink-0">
                {entry.currency}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 ml-[26px] flex-wrap">
            <p className="text-[11px] text-text-secondary font-body">
              {label}
            </p>
            <span className="text-border-custom text-[10px]">/</span>
            <p className={`font-mono text-sm font-semibold tabular-nums ${colorClass}`}>
              {formatCurrency(displayAmount, entryCurrency)}
            </p>
            {!isPaid && dueInfo.status !== "none" && (
              <>
                <span className="text-border-custom text-[10px]">/</span>
                <span className={`text-[10px] font-body px-1.5 py-0.5 rounded border ${dueInfo.badgeClass}`}>
                  {dueInfo.label}
                </span>
              </>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenDetail(entry.id)}
            className="text-[11px] text-text-secondary hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-surface-hover font-body cursor-pointer"
          >
            Detalle
          </button>
          <button
            onClick={() => onTogglePaid(entry.id)}
            className="text-[11px] px-2 py-1 rounded-md transition-colors font-body text-text-secondary hover:text-white hover:bg-surface-hover cursor-pointer"
          >
            {isPaid ? "Reabrir" : "Pagado"}
          </button>
        </div>
      </div>
    </div>
  )
}
