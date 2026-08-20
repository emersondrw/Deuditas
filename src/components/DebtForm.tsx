import { useState, useRef, useEffect, useMemo } from "react"
import type { DebtType } from "../types"
import { getCurrencyInfo, CURRENCIES } from "../utils/format"
import { CATEGORIES } from "../utils/categories"

interface Props {
  names: string[]
  currency?: string
  onAdd: (name: string, amount: number, type: DebtType, currency: string, category: string, dueDate?: string) => void
  onAddToExisting: (name: string, amount: number, type: DebtType, currency: string) => boolean
}

export function DebtForm({ names, currency = "PEN", onAdd, onAddToExisting }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<DebtType>("me-deben")
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [dueDate, setDueDate] = useState("")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearch, setCurrencySearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const currencyDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setSelectedCurrency(currency)
      setSelectedCategory("general")
      setDueDate("")
      setShowCurrencyDropdown(false)
      setCurrencySearch("")
    }
  }, [open, currency])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCurrencyDropdown(false)
      }
    }
    if (showCurrencyDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCurrencyDropdown])

  const selectedCurrencyInfo = useMemo(() => getCurrencyInfo(selectedCurrency), [selectedCurrency])

  const suggestions = useMemo(() => {
    if (name.trim().length < 2) return []
    const q = name.trim().toUpperCase()
    return names.filter(n => n.toUpperCase().includes(q) && n.toUpperCase() !== q).slice(0, 5)
  }, [name, names])

  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase()
    if (!q) return CURRENCIES
    return CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q))
    )
  }, [currencySearch])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions.length])

  const submit = (selectedName?: string) => {
    const finalName = (selectedName ?? name).trim().toUpperCase()
    const parsed = parseFloat(amount)
    if (!finalName || isNaN(parsed) || parsed <= 0) return

    const used = onAddToExisting(finalName, parsed, type, selectedCurrency)
    if (!used) {
      onAdd(finalName, parsed, type, selectedCurrency, selectedCategory, dueDate || undefined)
    }

    setName("")
    setAmount("")
    setDueDate("")
    setSelectedCategory("general")
    setShowSuggestions(false)
    setShowCurrencyDropdown(false)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") submit()
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        submit(suggestions[selectedIndex])
      } else {
        submit()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="mb-8">
      {open ? (
        <div className="ledger-card rounded-lg p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm font-medium text-white/80">Nueva deuda</p>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tipo de deuda */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setType("me-deben")}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors font-body cursor-pointer ${
                type === "me-deben"
                  ? "bg-accent-owed/10 text-accent-owed border border-accent-owed/25"
                  : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
              }`}
            >
              Me deben
            </button>
            <button
              onClick={() => setType("debo")}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors font-body cursor-pointer ${
                type === "debo"
                  ? "bg-accent-owe/10 text-accent-owe border border-accent-owe/25"
                  : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
              }`}
            >
              Debo
            </button>
          </div>

          {/* Selector de Categoría */}
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary mb-1.5 font-body">Categoría</p>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-1.5 px-2 rounded-md text-xs font-body flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                      isSelected
                        ? "bg-white/15 text-white border border-white/30 font-medium shadow-xs"
                        : "bg-[#141414] text-text-secondary border border-border-custom hover:bg-[#202020] hover:text-white"
                    }`}
                    title={cat.description}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.name.split("/")[0].trim()}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nombre con autocompletado */}
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="NOMBRE DE LA PERSONA"
              value={name}
              onChange={e => {
                setName(e.target.value.toUpperCase())
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full ledger-input rounded-md px-4 py-2.5 text-sm text-white placeholder-text-secondary/50 font-body uppercase"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={listRef}
                className="absolute z-10 left-0 right-0 mt-1 ledger-card rounded-md overflow-hidden border border-border-custom shadow-xl"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s}
                    onMouseDown={() => {
                      setName(s)
                      setShowSuggestions(false)
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors font-body ${
                      i === selectedIndex ? "bg-surface-hover text-white" : "text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selector de Moneda y Monto */}
          <div className="flex gap-2 relative mb-3">
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="h-full px-3 py-2.5 rounded-md ledger-input bg-[#181818] hover:bg-[#222] border border-border-custom hover:border-text-secondary/50 text-xs font-mono flex items-center gap-1.5 text-white transition-all cursor-pointer select-none"
                title="Cambiar moneda para este registro"
              >
                <span className="text-accent-owed font-semibold">{selectedCurrencyInfo.symbol}</span>
                <span className="text-text-secondary text-[11px]">{selectedCurrencyInfo.code}</span>
                <svg className="w-3 h-3 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCurrencyDropdown && (
                <div className="absolute z-30 bottom-full mb-1.5 left-0 w-64 ledger-card rounded-lg overflow-hidden border border-border-custom shadow-2xl animate-slide-up bg-[#121212]">
                  <div className="p-2 border-b border-border-custom">
                    <input
                      type="text"
                      placeholder="Buscar moneda..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="w-full ledger-input rounded px-2.5 py-1.5 text-xs text-white placeholder-text-secondary/50 font-body"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {filteredCurrencies.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCurrency(c.code)
                          setShowCurrencyDropdown(false)
                          setCurrencySearch("")
                        }}
                        className={`w-full px-2.5 py-1.5 rounded text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          c.code === selectedCurrency
                            ? "bg-accent-owed/20 text-accent-owed font-medium"
                            : "text-text-secondary hover:bg-surface-hover hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono font-semibold w-6 text-center">{c.symbol}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary shrink-0">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input
              type="number"
              placeholder={`0.00 (${selectedCurrencyInfo.symbol})`}
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit() }}
              className="flex-1 min-w-0 ledger-input rounded-md px-4 py-2.5 text-sm text-white placeholder-text-secondary/50 font-mono tabular-nums"
            />
          </div>

          {/* Fecha límite (opcional) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="debt-due-date" className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-body">
                Fecha límite de pago (opcional)
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="text-[10px] text-text-secondary hover:text-white underline cursor-pointer"
                >
                  Quitar fecha
                </button>
              )}
            </div>
            <input
              id="debt-due-date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full ledger-input rounded-md px-3 py-2 text-xs text-white font-body bg-[#141414] border border-border-custom"
            />
          </div>

          {/* Botón Registrar */}
          <button
            onClick={() => submit()}
            className="w-full py-3 rounded-md text-sm font-semibold bg-white text-[#0b0b0b] hover:bg-white/90 transition-colors font-body ledger-btn cursor-pointer"
          >
            Agregar deuda
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setOpen(true)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="w-full ledger-card rounded-lg py-4 text-text-secondary hover:text-white hover:bg-surface-hover transition-colors text-center text-sm font-medium font-body flex items-center justify-center gap-2 ledger-btn cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Dato
        </button>
      )}
    </div>
  )
}
