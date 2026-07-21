import { useState, useRef } from "react"
import { useDebtStore } from "./store"
import { SummaryBar } from "./components/SummaryBar"
import { DebtForm } from "./components/DebtForm"
import { DebtList } from "./components/DebtList"
import { DebtDetail } from "./components/DebtDetail"
import { InfoModal } from "./components/InfoModal"
import type { DebtType } from "./types"

export default function App() {
  const { entries, addEntry, addToExisting, togglePaid, findActiveByNameAndType, names, exportData, importData } = useDebtStore()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)

  const detailEntry = detailId ? entries.find(e => e.id === detailId) ?? null : null

  const handleAddToExisting = (name: string, amount: number, type: DebtType): boolean => {
    const existing = findActiveByNameAndType(name, type)
    if (existing) {
      addToExisting(existing.id, amount, "incremento", `Nuevo registro desde formulario`)
      return true
    }
    return false
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `deuditas-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Exportado correctamente")
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importData(reader.result as string)
      if (ok) {
        showToast("Importado correctamente")
      } else {
        showToast("Error: archivo inválido")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display leading-none">Deuditas</h1>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#333] transition-colors text-xs"
                  title="Cómo funciona"
                >
                  ?
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-2 font-body">Controla quién te debe y a quién le debes</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleExport}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-surface transition-colors font-body flex items-center gap-1"
                title="Exportar respaldo"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Exportar
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-surface transition-colors font-body flex items-center gap-1"
                title="Importar respaldo"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 15V3" />
                </svg>
                Importar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-border-custom select-none">
            <span className="flex-1 h-px bg-border-custom" />
            <span className="font-mono text-[10px] text-border-custom tracking-[0.2em]">DEUDITAS</span>
            <span className="flex-1 h-px bg-border-custom" />
          </div>
        </header>

        <SummaryBar entries={entries} />

        <DebtForm
          names={names}
          onAdd={addEntry}
          onAddToExisting={handleAddToExisting}
        />

        <DebtList
          entries={entries}
          onTogglePaid={togglePaid}
          onOpenDetail={setDetailId}
        />
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ledger-card rounded-xl px-5 py-3 text-sm text-white z-50 animate-slide-up shadow-lg">
          {toast}
        </div>
      )}

      <DebtDetail
        entry={detailEntry}
        onClose={() => setDetailId(null)}
        onAddPago={(id, amount, note) => addToExisting(id, amount, "pago-parcial", note)}
        onAddIncremento={(id, amount, note) => addToExisting(id, amount, "incremento", note)}
      />

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
