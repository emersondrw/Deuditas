/**
 * @description       : Modal for creating and updating trip expenses with beach category presets, smart splits, location, and tip breakdown.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState, useEffect } from "react"
import type { Trip, TripExpense, SplitMethod, ExpenseSplit } from "../../tripTypes"
import { TRIP_CATEGORIES, getTripCategoryInfo } from "../../utils/tripCategories"
import { formatCurrency, CURRENCIES, getCurrencyInfo } from "../../utils/format"

interface Props {
  open: boolean
  trip: Trip
  expense?: TripExpense | null
  onClose: () => void
  onSave: (params: {
    title: string
    amount: number
    currency: string
    paidById: string
    categoryId: string
    location?: string
    date?: string
    notes?: string
    splitMethod: SplitMethod
    splits?: ExpenseSplit[]
    tipAmount?: number
  }) => void
}

export function TripExpenseModal({ open, trip, expense, onClose, onSave }: Props) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState(trip.currency)
  const [paidById, setPaidById] = useState("")
  const [categoryId, setCategoryId] = useState("playa")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal")
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      if (expense) {
        setTitle(expense.title)
        setAmount(String(expense.amount))
        setCurrency(expense.currency || trip.currency)
        setPaidById(expense.paidById)
        setCategoryId(expense.categoryId)
        setLocation(expense.location || "")
        setDate(expense.date)
        setNotes(expense.notes || "")
        setTipAmount(expense.tipAmount ? String(expense.tipAmount) : "")
        setSplitMethod(expense.splitMethod)
        setSplits(expense.splits)
      } else {
        setTitle("")
        setAmount("")
        setCurrency(trip.currency)
        setPaidById(trip.participants[0]?.id || "")
        setCategoryId("playa")
        setLocation("")
        setDate(new Date().toISOString().slice(0, 10))
        setNotes("")
        setTipAmount("")
        setSplitMethod("equal")
        setSplits(
          trip.participants.map(p => ({
            participantId: p.id,
            amount: 0,
            included: true,
          }))
        )
      }
      setError(null)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, expense, trip])

  if (!open) return null

  const parsedAmount = parseFloat(amount) || 0
  const activeCategory = getTripCategoryInfo(categoryId)
  const currInfo = getCurrencyInfo(currency)

  // Toggle participant inclusion in 'selected' mode
  const handleToggleParticipant = (participantId: string) => {
    const next = splits.map(s => {
      if (s.participantId !== participantId) return s
      return { ...s, included: !s.included }
    })
    setSplits(next)
  }

  // Set custom amount for participant in 'custom' mode
  const handleCustomAmountChange = (participantId: string, val: string) => {
    const num = parseFloat(val) || 0
    const next = splits.map(s => {
      if (s.participantId !== participantId) return s
      return { ...s, amount: num, included: num > 0 }
    })
    setSplits(next)
  }

  const selectedCount = splits.filter(s => s.included).length
  const calculatedPerPerson =
    selectedCount > 0 ? parsedAmount / selectedCount : parsedAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Por favor ingresa un concepto para el gasto")
      return
    }
    if (parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0")
      return
    }
    if (!paidById) {
      setError("Selecciona quién realizó el pago")
      return
    }
    if (splitMethod === "selected" && selectedCount === 0) {
      setError("Debes incluir al menos a 1 participante en el gasto")
      return
    }

    const parsedTip = tipAmount.trim() ? parseFloat(tipAmount) : undefined

    onSave({
      title: title.trim(),
      amount: parsedAmount,
      currency: currency.toUpperCase(),
      paidById,
      categoryId,
      location: location.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      splitMethod,
      splits,
      tipAmount: parsedTip && !isNaN(parsedTip) ? parsedTip : undefined,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-x-hidden">
      <div className="ledger-card rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto overflow-x-hidden relative border border-border-custom shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${activeCategory.color}20`, borderColor: `${activeCategory.color}50` }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-lg"
            >
              {activeCategory.icon}
            </div>
            <div>
              <h2 className="font-body font-semibold text-lg text-white">
                {expense ? "Editar Gasto del Viaje" : "Registrar Gasto del Viaje"}
              </h2>
              <p className="text-xs text-text-secondary">
                {trip.name} • {trip.destination || "Playa & Turismo"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-body flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Category Suggestions Chips */}
          <div>
            <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-2">
              Categoría Temática
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRIP_CATEGORIES.map(cat => {
                const isSelected = cat.id === categoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    style={
                      isSelected
                        ? { borderColor: cat.color, backgroundColor: `${cat.color}15` }
                        : {}
                    }
                    className={`
                      p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer
                      ${
                        isSelected
                          ? "text-white font-medium shadow-xs"
                          : "border-border-custom bg-[#141414] text-text-secondary hover:bg-[#1a1a1a] hover:text-white"
                      }
                    `}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs truncate">{cat.name.split("&")[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Title Suggestions based on Category */}
          {activeCategory.suggestions && activeCategory.suggestions.length > 0 && !expense && (
            <div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-text-secondary mr-1 self-center">Sugerencias:</span>
                {activeCategory.suggestions.slice(0, 3).map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1c1c1c] hover:bg-[#252525] text-cyan-300/80 hover:text-cyan-200 border border-border-custom transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Concepto / Título */}
          <div>
            <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
              Concepto del Gasto *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Toldo y reposeras en la playa"
              className="w-full ledger-input rounded-lg px-3.5 py-2.5 text-sm text-white font-body placeholder:text-text-secondary/50"
              required
            />
          </div>

          {/* Monto, Moneda y Propina */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Monto Total * ({currInfo.symbol})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 ledger-input rounded-lg px-3.5 py-2.5 text-base text-white font-mono font-semibold placeholder:text-text-secondary/50"
                  required
                />
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-24 ledger-input rounded-lg px-2 py-2 text-xs font-mono text-white bg-[#181818] cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Propina (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tipAmount}
                onChange={e => setTipAmount(e.target.value)}
                placeholder="0.00"
                className="w-full ledger-input rounded-lg px-3 py-2.5 text-sm text-amber-300 font-mono placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Quién pagó y Lugar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                ¿Quién pagó el dinero? *
              </label>
              <select
                value={paidById}
                onChange={e => setPaidById(e.target.value)}
                className="w-full ledger-input rounded-lg px-3 py-2.5 text-sm text-white font-body bg-[#181818] cursor-pointer"
                required
              >
                {trip.participants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Lugar / Restaurante / Playa
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Playa Los Órganos"
                className="w-full ledger-input rounded-lg px-3.5 py-2.5 text-sm text-white font-body placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Fecha */}
          <div className="min-w-0">
            <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
              Fecha del Gasto
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full ledger-input rounded-lg text-white font-mono min-w-0"
            />
          </div>

          {/* DIVISIÓN DE GASTO (SPLIT) */}
          <div className="p-3.5 bg-[#121212] rounded-xl border border-border-custom">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-body font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>👥</span>
                <span>¿Cómo se divide este gasto?</span>
              </label>
              <span className="text-xs font-mono text-cyan-300">
                {parsedAmount > 0 ? formatCurrency(parsedAmount, currency) : ""}
              </span>
            </div>

            {/* Split Type Selector */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 bg-[#1a1a1a] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSplitMethod("equal")}
                className={`py-1.5 px-2 rounded-md text-xs font-body transition-colors cursor-pointer ${
                  splitMethod === "equal"
                    ? "bg-[#282828] text-cyan-300 font-semibold shadow-xs"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Equitativo
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod("selected")}
                className={`py-1.5 px-2 rounded-md text-xs font-body transition-colors cursor-pointer ${
                  splitMethod === "selected"
                    ? "bg-[#282828] text-cyan-300 font-semibold shadow-xs"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Seleccionar
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod("custom")}
                className={`py-1.5 px-2 rounded-md text-xs font-body transition-colors cursor-pointer ${
                  splitMethod === "custom"
                    ? "bg-[#282828] text-cyan-300 font-semibold shadow-xs"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Montos
              </button>
            </div>

            {/* Split Display Content */}
            {splitMethod === "equal" && (
              <div className="text-xs text-text-secondary font-body bg-[#181818] p-2.5 rounded-lg flex items-center justify-between">
                <span>Dividido entre los {trip.participants.length} viajeros:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {formatCurrency(parsedAmount / (trip.participants.length || 1), currency)} / persona
                </span>
              </div>
            )}

            {splitMethod === "selected" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1">
                  <span>Marca quiénes consumieron ({selectedCount}/{trip.participants.length}):</span>
                  <span className="font-mono text-cyan-300">
                    {formatCurrency(calculatedPerPerson, currency)} c/u
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {trip.participants.map(p => {
                    const currentSplit = splits.find(s => s.participantId === p.id)
                    const isInc = currentSplit ? currentSplit.included : true
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleParticipant(p.id)}
                        className={`
                          p-2 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer
                          ${
                            isInc
                              ? "bg-cyan-950/30 border-cyan-500/40 text-white"
                              : "bg-[#181818] border-border-custom text-text-secondary opacity-60"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: p.avatarColor || "#06b6d4" }}
                            className="w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center font-mono"
                          >
                            {p.name.charAt(0)}
                          </span>
                          <span className="text-xs font-body font-medium">{p.name}</span>
                        </div>
                        <span className="text-xs">{isInc ? "✓" : "—"}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {splitMethod === "custom" && (
              <div className="space-y-2">
                <p className="text-[11px] text-text-secondary mb-1">
                  Asigna el monto correspondiente a cada participante:
                </p>
                {trip.participants.map(p => {
                  const currentSplit = splits.find(s => s.participantId === p.id)
                  const currentVal = currentSplit ? currentSplit.amount : 0
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#181818] border border-border-custom"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: p.avatarColor || "#06b6d4" }}
                          className="w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center font-mono"
                        >
                          {p.name.charAt(0)}
                        </span>
                        <span className="text-xs font-body text-white">{p.name}</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentVal || ""}
                        onChange={e => handleCustomAmountChange(p.id, e.target.value)}
                        placeholder="0.00"
                        className="w-24 ledger-input rounded-md px-2 py-1 text-xs text-right font-mono text-cyan-300"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
              Notas / Referencia (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Ticket #458, pagado con Yape/Tarjeta"
              className="w-full ledger-input rounded-lg px-3.5 py-2 text-xs text-white font-body placeholder:text-text-secondary/50"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-custom mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-body text-text-secondary hover:text-white bg-[#1c1c1c] hover:bg-[#252525] border border-border-custom transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-body font-semibold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-950/40 cursor-pointer active:scale-95"
            >
              {expense ? "Actualizar Gasto" : "Guardar Gasto 🏖️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
