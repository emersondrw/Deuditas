import { useState, useEffect } from "react"
import type { DebtEntry } from "../types"
import { formatCurrency, getDebtStatus, getCurrencyInfo, getDueDateStatus, generateWhatsAppMessage } from "../utils/format"
import { getCategoryInfo } from "../utils/categories"

interface Props {
  entry: DebtEntry | null
  currency?: string
  onClose: () => void
  onAddPago: (id: string, amount: number, note?: string) => void
  onAddIncremento: (id: string, amount: number, note?: string) => void
}

export function DebtDetail({ entry, currency = "PEN", onClose, onAddPago, onAddIncremento }: Props) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [action, setAction] = useState<"pago" | "incremento" | null>(null)

  useEffect(() => {
    if (entry) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [entry])

  if (!entry) return null

  const activeCurrency = entry.currency || currency
  const currencyInfo = getCurrencyInfo(activeCurrency)
  const category = getCategoryInfo(entry.category)
  const dueInfo = getDueDateStatus(entry.dueDate)
  const { displayAmount, label, colorClass } = getDebtStatus(entry)

  const handleSubmit = () => {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return

    if (action === "pago") {
      onAddPago(entry.id, parsed, note || undefined)
    } else if (action === "incremento") {
      onAddIncremento(entry.id, parsed, note || undefined)
    }

    setAmount("")
    setNote("")
    setAction(null)
  }

  const handleWhatsAppShare = () => {
    const msg = generateWhatsAppMessage(entry, category.name, activeCurrency)
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  const history = [...entry.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-[#0b0b0b] border-t border-border-custom sm:border rounded-t-xl sm:rounded-xl p-6 animate-slide-up shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base" title={category.name}>{category.icon}</span>
              <h2 className={`font-display text-xl ${colorClass}`}>
                {entry.name}
              </h2>
              {entry.currency && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-text-secondary border border-border-custom">
                  {entry.currency}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-text-secondary font-body">
                {label}
              </p>
              <span className="text-border-custom text-[10px]">•</span>
              <span className="text-xs text-text-secondary font-body">
                {category.name}
              </span>
              {entry.status === "activo" && dueInfo.status !== "none" && (
                <>
                  <span className="text-border-custom text-[10px]">•</span>
                  <span className={`text-[10px] font-body px-1.5 py-0.5 rounded border ${dueInfo.badgeClass}`}>
                    {dueInfo.label}
                  </span>
                </>
              )}
            </div>

            <p className={`font-mono text-xl font-semibold tabular-nums mt-1.5 ${colorClass}`}>
              {formatCurrency(displayAmount, activeCurrency)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Botón Recordatorio WhatsApp */}
        <div className="mb-5">
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2 px-3 rounded-lg bg-[#141414] hover:bg-[#14261b] border border-border-custom hover:border-emerald-500/50 text-text-secondary hover:text-emerald-300 text-xs font-body flex items-center justify-center gap-2 transition-all cursor-pointer group"
            title="Compartir o recordar por WhatsApp"
          >
            <svg className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.179-.548-1.503-.63-2.47-2.164-2.545-2.264-.074-.101-.611-.813-.611-1.55 0-.737.387-1.1.524-1.25.137-.15.3-.187.4-.187.1 0 .2.001.288.006.096.005.225-.036.35.265.13.313.443 1.077.481 1.157.039.08.065.174.013.279-.053.104-.08.169-.158.26-.079.091-.166.203-.237.272-.08.077-.164.16-.07.322.094.162.417.689.897 1.116.618.55 1.139.721 1.301.802.162.08.257.07.353-.04.096-.11.411-.478.521-.642.11-.164.22-.137.369-.082.15.055.952.449 1.116.531.164.082.274.123.314.192.04.068.04.397-.104.802z" />
            </svg>
            <span>Recordar por WhatsApp</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setAction("pago"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors font-body cursor-pointer ${
              action === "pago"
                ? "bg-accent-owed/10 text-accent-owed border border-accent-owed/25"
                : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
            }`}
          >
            Pago parcial
          </button>
          <button
            onClick={() => { setAction("incremento"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors font-body cursor-pointer ${
              action === "incremento"
                ? "bg-accent-owe/10 text-accent-owe border border-accent-owe/25"
                : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
            }`}
          >
            Incrementar
          </button>
        </div>

        {action && (
          <div className="mb-6 p-4 rounded-md ledger-card">
            <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary mb-3 font-body">
              {action === "pago" ? `Registrar pago parcial (${activeCurrency})` : `Incrementar deuda (${activeCurrency})`}
            </p>
            <input
              type="number"
              placeholder={`Monto (${currencyInfo.symbol})`}
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
              className="w-full ledger-input rounded-md px-4 py-3 text-sm text-white placeholder-text-secondary/50 font-mono tabular-nums mb-2"
              autoFocus
            />
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
              className="w-full ledger-input rounded-md px-4 py-3 text-sm text-white placeholder-text-secondary/50 font-body mb-3"
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-md text-sm font-semibold bg-white text-[#0b0b0b] hover:bg-white/90 transition-colors font-body ledger-btn"
            >
              {action === "pago" ? "Registrar pago" : "Incrementar"}
            </button>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Historial
            </p>
            <span className="font-mono text-[10px] text-border-custom">{history.length}</span>
          </div>
          {history.map(h => {
            const histCurrency = h.currency || activeCurrency
            return (
              <div
                key={h.id}
                className="flex items-center justify-between py-2.5 border-b border-border-custom/50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-body">
                    {h.type === "creacion" && "Creación"}
                    {h.type === "pago-parcial" && "Pago parcial"}
                    {h.type === "incremento" && "Incremento"}
                    {h.note && (
                      <span className="text-text-secondary ml-1.5">— {h.note}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5 font-mono">
                    {new Date(h.date).toLocaleDateString(currencyInfo.locale || "es-PE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm font-semibold tabular-nums shrink-0 ml-3 ${
                    h.type === "pago-parcial" ? "text-accent-owed" : "text-accent-owe"
                  }`}
                >
                  {h.type === "pago-parcial" ? "-" : "+"}{formatCurrency(Math.abs(h.amount), histCurrency)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
