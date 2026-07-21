import { useState, useEffect } from "react"
import type { DebtEntry } from "../types"
import { formatCurrency } from "../utils/format"

interface Props {
  entry: DebtEntry | null
  onClose: () => void
  onAddPago: (id: string, amount: number, note?: string) => void
  onAddIncremento: (id: string, amount: number, note?: string) => void
}

export function DebtDetail({ entry, onClose, onAddPago, onAddIncremento }: Props) {
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

  const isOwed = entry.type === "me-deben"

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`font-display text-xl ${isOwed ? "text-accent-owed" : "text-accent-owe"}`}>
              {entry.name}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5 font-body">
              {isOwed ? "Te debe" : "Le debes"}
            </p>
            <p className={`font-mono text-lg font-semibold tabular-nums mt-1 ${isOwed ? "text-accent-owed" : "text-accent-owe"}`}>
              {formatCurrency(entry.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setAction("pago"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors font-body ${
              action === "pago"
                ? "bg-accent-owed/10 text-accent-owed border border-accent-owed/25"
                : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
            }`}
          >
            Pago parcial
          </button>
          <button
            onClick={() => { setAction("incremento"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors font-body ${
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
              {action === "pago" ? "Registrar pago parcial" : "Incrementar deuda"}
            </p>
            <input
              type="number"
              placeholder="Monto"
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
          {history.map(h => (
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
                  {new Date(h.date).toLocaleDateString("es-MX", {
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
                {h.type === "pago-parcial" ? "-" : "+"}{formatCurrency(Math.abs(h.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
