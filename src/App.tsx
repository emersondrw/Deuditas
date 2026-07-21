import { useState, useRef } from "react"
import { useDebtStore } from "./store"
import { SummaryBar } from "./components/SummaryBar"
import { DebtForm } from "./components/DebtForm"
import { DebtList } from "./components/DebtList"
import { DebtDetail } from "./components/DebtDetail"
import type { DebtType } from "./types"

export default function App() {
  const { entries, addEntry, addToExisting, togglePaid, findActiveByNameAndType, names, exportData, importData } = useDebtStore()
  const [detailId, setDetailId] = useState<string | null>(null)
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
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Deuditas</h1>
              <p className="text-sm text-neutral-500 mt-0.5">Controla quién te debe y a quién le debes</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="glass rounded-xl px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                title="Exportar respaldo"
              >
                ⬇
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-xl px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                title="Importar respaldo"
              >
                ⬆
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-xl px-5 py-3 text-sm text-white z-50 animate-slide-up">
          {toast}
        </div>
      )}

      <DebtDetail
        entry={detailEntry}
        onClose={() => setDetailId(null)}
        onAddPago={(id, amount, note) => addToExisting(id, amount, "pago-parcial", note)}
        onAddIncremento={(id, amount, note) => addToExisting(id, amount, "incremento", note)}
      />
    </div>
  )
}
