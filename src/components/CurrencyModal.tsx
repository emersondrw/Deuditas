/**
 * @description       : Modal for selecting and customizing the application's active currency.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-19
 **/
import { useState, useEffect, useMemo } from "react"
import { CURRENCIES, formatCurrency } from "../utils/format"

interface Props {
  open: boolean
  currentCurrency: string
  onSelectCurrency: (code: string) => void
  onClose: () => void
}

export function CurrencyModal({ open, currentCurrency, onSelectCurrency, onClose }: Props) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      setSearch("")
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const filteredCurrencies = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CURRENCIES
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q))
    )
  }, [search])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[88vh] flex flex-col bg-[#0b0b0b] border-t border-border-custom sm:border rounded-t-xl sm:rounded-xl p-6 animate-slide-up shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-white">Configuración de moneda</h2>
            <p className="text-xs text-text-secondary font-body mt-0.5">
              Elige la moneda para mostrar todos tus balances y transacciones
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar por moneda, país o código (ej. Sol, USD, México)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ledger-input rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-text-secondary/50 font-body"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lista de monedas */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[50vh]">
          {filteredCurrencies.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-xs font-body">
              No se encontraron monedas que coincidan con &quot;{search}&quot;
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = c.code.toUpperCase() === currentCurrency.toUpperCase()
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelectCurrency(c.code)
                    onClose()
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isSelected
                      ? "bg-accent-owed/10 border-accent-owed/40 text-white shadow-xs"
                      : "bg-[#141414] border-border-custom/80 hover:bg-[#1c1c1c] hover:border-text-secondary/40 text-text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-semibold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? "bg-accent-owed/20 text-accent-owed border border-accent-owed/30"
                          : "bg-surface text-text-secondary group-hover:text-white border border-border-custom"
                      }`}
                    >
                      {c.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-body font-medium text-xs truncate ${isSelected ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface text-text-secondary border border-border-custom shrink-0">
                          {c.code}
                        </span>
                      </div>
                      {c.country && (
                        <p className="text-[11px] text-text-secondary font-body mt-0.5 truncate">
                          {c.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-mono text-xs tabular-nums font-semibold ${isSelected ? "text-accent-owed" : "text-text-secondary group-hover:text-white/80"}`}>
                      {formatCurrency(1250, c.code)}
                    </p>
                    {isSelected && (
                      <span className="text-[10px] font-body text-accent-owed font-medium flex items-center justify-end gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Activa
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border-custom flex items-center justify-between text-[11px] text-text-secondary font-body">
          <span>Moneda seleccionada: <strong className="text-white font-mono">{currentCurrency}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-[#222] hover:bg-[#2a2a2a] text-text-secondary hover:text-white transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
