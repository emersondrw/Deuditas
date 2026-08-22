/**
 * @description       : Modal component for creating or modifying a group trip, setting currency, destination, budget, and participants.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState, useEffect } from "react"
import { CURRENCIES, getCurrencyInfo } from "../../utils/format"
import type { Trip } from "../../tripTypes"

interface Props {
  open: boolean
  onClose: () => void
  onCreateTrip: (
    name: string,
    destination: string,
    currency: string,
    participantNames: string[],
    options?: {
      startDate?: string
      endDate?: string
      budget?: number
    }
  ) => void
  defaultCurrency?: string
  editingTrip?: Trip | null
  onUpdateTrip?: (
    tripId: string,
    updates: Partial<Omit<Trip, "id" | "createdAt" | "participants">>
  ) => void
}

const TRIP_NAME_SUGGESTIONS = [
  "🏖️ Viaje a la Playa 2026",
  "🌊 Vacaciones en Máncora",
  "🍹 Escapada de Fin de Semana",
  "🚤 Tour y Aventura Marina",
  "🌴 Cancún & Riviera Maya",
]

const POPULAR_DESTINATIONS = [
  "Máncora / Punta Sal",
  "Cancún / Playa del Carmen",
  "Cartagena / Barú",
  "San Andrés",
  "Paracas / Huacachina",
  "Punta Cana",
]

export function TripCreateModal({
  open,
  onClose,
  onCreateTrip,
  defaultCurrency = "PEN",
  editingTrip = null,
  onUpdateTrip,
}: Props) {
  const [name, setName] = useState("")
  const [destination, setDestination] = useState("")
  const [currency, setCurrency] = useState(defaultCurrency)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [participantInput, setParticipantInput] = useState("")
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      if (editingTrip) {
        setName(editingTrip.name)
        setDestination(editingTrip.destination)
        setCurrency(editingTrip.currency)
        setStartDate(editingTrip.startDate)
        setEndDate(editingTrip.endDate || "")
        setBudget(editingTrip.budget ? String(editingTrip.budget) : "")
        setParticipants(editingTrip.participants.map(p => p.name))
      } else {
        setName("")
        setDestination("")
        setCurrency(defaultCurrency)
        setStartDate(new Date().toISOString().slice(0, 10))
        setEndDate("")
        setBudget("")
        setParticipants(["YO", "AMIGO 1"])
      }
      setParticipantInput("")
      setError(null)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, editingTrip, defaultCurrency])

  if (!open) return null

  const handleAddParticipant = () => {
    const clean = participantInput.trim().toUpperCase()
    if (!clean) return
    if (participants.includes(clean)) {
      setError(`"${clean}" ya está en la lista de viajeros`)
      return
    }
    setParticipants([...participants, clean])
    setParticipantInput("")
    setError(null)
  }

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 2 && !editingTrip) {
      setError("Se requieren al menos 2 viajeros para un viaje grupal")
      return
    }
    setParticipants(participants.filter((_, i) => i !== index))
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Por favor ingresa un nombre para el viaje")
      return
    }
    if (!editingTrip && participants.length < 2) {
      setError("Agrega al menos 2 personas para poder dividir los gastos")
      return
    }

    const parsedBudget = budget.trim() ? parseFloat(budget) : undefined

    if (editingTrip && onUpdateTrip) {
      onUpdateTrip(editingTrip.id, {
        name: name.trim(),
        destination: destination.trim(),
        currency: currency.toUpperCase(),
        startDate,
        endDate: endDate.trim() || undefined,
        budget: parsedBudget && !isNaN(parsedBudget) ? parsedBudget : undefined,
      })
    } else {
      onCreateTrip(
        name.trim(),
        destination.trim() || "Playa & Turismo",
        currency.toUpperCase(),
        participants,
        {
          startDate,
          endDate: endDate.trim() || undefined,
          budget: parsedBudget && !isNaN(parsedBudget) ? parsedBudget : undefined,
        }
      )
    }

    onClose()
  }

  const currInfo = getCurrencyInfo(currency)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="ledger-card rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto relative border border-border-custom shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              🏖️
            </div>
            <div>
              <h2 className="font-body font-semibold text-lg text-white">
                {editingTrip ? "Editar Viaje" : "Nuevo Viaje en Grupo"}
              </h2>
              <p className="text-xs text-text-secondary">
                {editingTrip ? "Modifica los datos del viaje" : "Configura tu viaje de playa o turismo"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-mono"
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
          {/* Nombre del Viaje */}
          <div>
            <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
              Nombre del Viaje *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Semana Santa en la Playa 🌊"
              className="w-full ledger-input rounded-lg px-3.5 py-2.5 text-sm text-white font-body placeholder:text-text-secondary/50"
              required
            />
            {/* Quick Name Suggestions */}
            {!editingTrip && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TRIP_NAME_SUGGESTIONS.slice(0, 3).map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setName(sug)}
                    className="text-[11px] px-2 py-1 rounded-md bg-[#202020] hover:bg-[#282828] text-text-secondary hover:text-cyan-200 border border-border-custom transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destino y Moneda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Destino Turístico / Playa
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Ej: Máncora / Cancún"
                className="w-full ledger-input rounded-lg px-3.5 py-2.5 text-sm text-white font-body placeholder:text-text-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Moneda del Viaje
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full ledger-input rounded-lg px-3 py-2.5 text-sm text-white font-body bg-[#181818] cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destinos Populares Quick Chips */}
          {!editingTrip && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-text-secondary mr-1 self-center">Popular:</span>
              {POPULAR_DESTINATIONS.slice(0, 4).map(dest => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c1c] hover:bg-[#252525] text-text-secondary hover:text-white border border-border-custom/80 transition-colors cursor-pointer"
                >
                  {dest}
                </button>
              ))}
            </div>
          )}

          {/* Fechas y Presupuesto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full ledger-input rounded-lg px-3 py-2 text-xs text-white font-mono bg-[#181818]"
              />
            </div>
            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Fecha Fin (Opcional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full ledger-input rounded-lg px-3 py-2 text-xs text-white font-mono bg-[#181818]"
              />
            </div>
            <div>
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Presupuesto ({currInfo.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Ej: 2500"
                className="w-full ledger-input rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Participantes (Solo al crear nuevo viaje o informativo) */}
          {!editingTrip && (
            <div className="pt-2 border-t border-border-custom/60">
              <label className="block text-xs font-body text-text-secondary uppercase tracking-wider mb-1.5">
                Viajeros / Integrantes del Grupo ({participants.length})
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={participantInput}
                  onChange={e => setParticipantInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddParticipant()
                    }
                  }}
                  placeholder="Nombre de viajero (ej: CARLOS)"
                  className="flex-1 ledger-input rounded-lg px-3.5 py-2 text-xs text-white font-body placeholder:text-text-secondary/50 uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-3 py-2 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-600/40 text-xs font-body font-medium transition-colors cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              {/* Badges de participantes */}
              <div className="flex flex-wrap gap-2 p-2.5 bg-[#121212] rounded-xl border border-border-custom min-h-[44px] items-center">
                {participants.map((p, idx) => (
                  <span
                    key={`${p}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#222] border border-border-custom text-xs font-body text-white group"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="text-text-secondary hover:text-rose-400 ml-1 text-xs font-mono cursor-pointer"
                      title="Quitar participante"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">
                💡 Puedes añadir más personas o ajustar participantes en cualquier momento dentro del viaje.
              </p>
            </div>
          )}

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
              {editingTrip ? "Guardar Cambios" : "Crear Viaje 🏖️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
