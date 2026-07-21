import { useState, useRef, useEffect, useMemo } from "react"
import type { DebtType } from "../types"

interface Props {
  names: string[]
  onAdd: (name: string, amount: number, type: DebtType) => void
  onAddToExisting: (name: string, amount: number, type: DebtType) => boolean
}

export function DebtForm({ names, onAdd, onAddToExisting }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<DebtType>("me-deben")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const suggestions = useMemo(() => {
    if (name.trim().length < 2) return []
    const q = name.toLowerCase()
    return names.filter(n => n.includes(q) && n !== name.toLowerCase()).slice(0, 5)
  }, [name, names])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions.length])

  const submit = (selectedName?: string) => {
    const finalName = (selectedName ?? name).trim()
    const parsed = parseFloat(amount)
    if (!finalName || isNaN(parsed) || parsed <= 0) return

    const used = onAddToExisting(finalName, parsed, type)
    if (!used) {
      onAdd(finalName, parsed, type)
    }

    setName("")
    setAmount("")
    setShowSuggestions(false)
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
    <div className="mb-6">
      {open ? (
        <div className="glass rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-neutral-300">Nueva deuda</p>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/20 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setType("me-deben")}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                type === "me-deben"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-neutral-400 border border-transparent"
              }`}
            >
              Me deben
            </button>
            <button
              onClick={() => setType("debo")}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                type === "debo"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 text-neutral-400 border border-transparent"
              }`}
            >
              Debo
            </button>
          </div>

          <div className="relative mb-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={e => {
                setName(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 border border-white/10 focus:outline-none focus:border-white/30 transition-colors"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={listRef}
                className="absolute z-10 left-0 right-0 mt-1 glass rounded-xl overflow-hidden border border-white/10"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s}
                    onMouseDown={() => {
                      setName(s)
                      setShowSuggestions(false)
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      i === selectedIndex ? "bg-white/20 text-white" : "text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit() }}
              className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 border border-white/10 focus:outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => submit()}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setOpen(true)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="w-full glass rounded-2xl py-4 text-neutral-400 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center text-sm font-medium flex items-center justify-center gap-2"
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
