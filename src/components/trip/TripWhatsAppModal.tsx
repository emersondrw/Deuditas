/**
 * @description       : Modal for previewing and sharing the trip settlement summary on WhatsApp with emoji formatting and one-click copy.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState } from "react"
import type { Trip, TripExpense } from "../../tripTypes"
import { generateTripWhatsAppMessage } from "../../utils/tripSettlement"

interface Props {
  open: boolean
  trip: Trip
  expenses: TripExpense[]
  onClose: () => void
}

export function TripWhatsAppModal({ open, trip, expenses, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const encodedMsg = generateTripWhatsAppMessage(trip, expenses)
  const decodedText = decodeURIComponent(encodedMsg)

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodedMsg}`
    window.open(url, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="ledger-card rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto relative border border-border-custom shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-lg">
              📱
            </div>
            <div>
              <h2 className="font-body font-semibold text-lg text-white">
                Resumen para WhatsApp
              </h2>
              <p className="text-xs text-text-secondary">
                Comparte las cuentas claras en el grupo del viaje
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

        {/* Message Preview Box */}
        <div className="bg-[#121212] border border-border-custom rounded-xl p-4 mb-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto select-all">
          {decodedText}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border-custom">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#222] hover:bg-[#2a2a2a] border border-border-custom text-white text-xs font-body font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{copied ? "✓ Copiado" : "📋 Copiar Texto"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-body font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
          >
            <span>📲 Abrir en WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  )
}
