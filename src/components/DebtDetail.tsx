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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto glass rounded-t-3xl sm:rounded-3xl p-6 border border-white/10 animate-slide-up"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${isOwed ? "text-green-400" : "text-red-400"}`}>
              {entry.name}
            </h2>
            <p className="text-sm text-neutral-400 mt-0.5">
              {isOwed ? "Te debe" : "Le debes"} —{" "}
              <span className={isOwed ? "text-green-400" : "text-red-400"}>
                {formatCurrency(entry.amount)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setAction("pago"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              action === "pago"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/10 text-neutral-300 border border-transparent hover:bg-white/20"
            }`}
          >
            Pago parcial
          </button>
          <button
            onClick={() => { setAction("incremento"); setAmount("") }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              action === "incremento"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/10 text-neutral-300 border border-transparent hover:bg-white/20"
            }`}
          >
            Incrementar
          </button>
        </div>

        {action && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
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
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 border border-white/10 focus:outline-none focus:border-white/30 transition-colors mb-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 border border-white/10 focus:outline-none focus:border-white/30 transition-colors mb-3"
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors"
            >
              {action === "pago" ? "Registrar pago" : "Incrementar"}
            </button>
          </div>
        )}

        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
            Historial ({history.length})
          </p>
          {history.map(h => (
            <div
              key={h.id}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-300">
                  {h.type === "creacion" && "Creación"}
                  {h.type === "pago-parcial" && "Pago parcial"}
                  {h.type === "incremento" && "Incremento"}
                  {h.note && (
                    <span className="text-neutral-500 ml-1">— {h.note}</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
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
                className={`text-sm font-medium shrink-0 ml-3 ${
                  h.type === "pago-parcial" ? "text-green-400" : "text-red-400"
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
