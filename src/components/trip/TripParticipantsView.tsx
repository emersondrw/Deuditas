/**
 * @description       : View for managing trip participants, adding new members, and checking participant involvement.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState } from "react"
import type { Trip, TripExpense } from "../../tripTypes"
import { formatCurrency } from "../../utils/format"
import { calculateTripBalances } from "../../utils/tripSettlement"

interface Props {
  trip: Trip
  expenses: TripExpense[]
  onAddParticipant: (name: string) => void
  onRemoveParticipant: (participantId: string) => void
}

export function TripParticipantsView({
  trip,
  expenses,
  onAddParticipant,
  onRemoveParticipant,
}: Props) {
  const [nameInput, setNameInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { balances } = calculateTripBalances(trip, expenses)
  const tripCurrency = trip.currency || "PEN"

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = nameInput.trim().toUpperCase()
    if (!clean) return
    if (trip.participants.some(p => p.name === clean)) {
      setError(`"${clean}" ya forma parte de este viaje`)
      return
    }
    onAddParticipant(clean)
    setNameInput("")
    setError(null)
  }

  const handleRemove = (participantId: string, participantName: string) => {
    const hasExpenses = expenses.some(
      e =>
        e.tripId === trip.id &&
        (e.paidById === participantId || e.splits.some(s => s.participantId === participantId && s.included))
    )

    if (hasExpenses) {
      alert(`No se puede eliminar a "${participantName}" porque ya tiene gastos asociados en este viaje.`)
      return
    }

    if (trip.participants.length <= 2) {
      alert("Un viaje grupal debe tener al menos 2 participantes.")
      return
    }

    if (confirm(`¿Quitar a "${participantName}" del viaje?`)) {
      onRemoveParticipant(participantId)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Add Participant Input */}
      <form onSubmit={handleAdd} className="ledger-card rounded-xl p-4">
        <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-2">
          Agregar nuevo viajero al grupo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Nombre (ej: VALERIA)"
            className="flex-1 ledger-input rounded-lg px-3.5 py-2 text-xs text-white font-body placeholder:text-text-secondary/50 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-body font-medium transition-colors cursor-pointer"
          >
            + Añadir
          </button>
        </div>
        {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}
      </form>

      {/* Participants List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
            Integrantes del Viaje ({trip.participants.length})
          </h3>
        </div>

        <div className="space-y-2">
          {trip.participants.map(p => {
            const b = balances.find(item => item.participantId === p.id)
            const paid = b ? b.totalPaid : 0
            const owed = b ? b.totalOwed : 0

            return (
              <div
                key={p.id}
                className="ledger-card rounded-xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    style={{ backgroundColor: p.avatarColor || "#06b6d4" }}
                    className="w-9 h-9 rounded-full text-xs font-bold text-black flex items-center justify-center font-mono shrink-0 shadow-xs"
                  >
                    {p.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-body font-medium text-sm text-white truncate">{p.name}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Aportó {formatCurrency(paid, tripCurrency)} • Consumió {formatCurrency(owed, tripCurrency)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(p.id, p.name)}
                  className="text-text-secondary hover:text-rose-400 p-2 rounded-lg hover:bg-surface-hover transition-colors text-xs font-mono cursor-pointer"
                  title="Quitar participante"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
