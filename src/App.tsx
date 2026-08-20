import { useState, useRef } from "react"
import { useDebtStore } from "./store"
import { SummaryBar } from "./components/SummaryBar"
import { DebtForm } from "./components/DebtForm"
import { DebtList } from "./components/DebtList"
import { DebtDetail } from "./components/DebtDetail"
import { InfoModal } from "./components/InfoModal"
import { ExportModal } from "./components/ExportModal"
import { CurrencyModal } from "./components/CurrencyModal"
import { exportToExcel } from "./utils/exportExcel"
import { getCurrencyInfo } from "./utils/format"
import type { DebtType } from "./types"

export default function App() {
  const { entries, currency, setCurrency, addEntry, updateEntry, addToExisting, togglePaid, findActiveByNameTypeAndCurrency, names, exportData, importData } = useDebtStore()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)

  const currencyInfo = getCurrencyInfo(currency)
  const detailEntry = detailId ? entries.find(e => e.id === detailId) ?? null : null

  const handleAddToExisting = (name: string, amount: number, type: DebtType, itemCurrency: string): boolean => {
    const existing = findActiveByNameTypeAndCurrency(name, type, itemCurrency)
    if (existing) {
      addToExisting(existing.id, amount, "incremento", `Nuevo registro desde formulario`)
      return true
    }
    return false
  }

  const handleExportJson = () => {
    const json = exportData()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `deuditas-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Respaldo JSON exportado")
  }

  const handleExportExcel = () => {
    exportToExcel(entries, currency)
    showToast("Reporte Excel exportado")
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-3xl font-display leading-none">Deuditas</h1>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#333] transition-colors text-xs cursor-pointer"
                  title="Cómo funciona"
                >
                  ?
                </button>
                <button
                  onClick={() => setCurrencyModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-[#181818] border border-border-custom hover:border-text-secondary/50 hover:bg-[#222] text-xs font-mono text-white/90 hover:text-white transition-all flex items-center gap-1.5 group cursor-pointer shadow-xs"
                  title="Cambiar moneda"
                >
                  <span className="text-accent-owed font-semibold">{currencyInfo.symbol}</span>
                  <span className="text-text-secondary group-hover:text-white text-[11px] transition-colors">{currencyInfo.code}</span>
                  <svg className="w-3 h-3 text-text-secondary/60 group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-2 font-body">Controla quién te debe y a quién le debes</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {/* Botón Exportar (Hacia afuera / Subida / Exportación) */}
              <button
                onClick={() => setExportModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom/80 hover:border-emerald-500/40 transition-all font-body flex items-center gap-1.5 cursor-pointer group"
                title="Exportar registros (JSON o Excel)"
              >
                <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Exportar</span>
              </button>

              {/* Botón Importar (Hacia adentro / Bajada / Carga) */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom/80 hover:border-blue-500/40 transition-all font-body flex items-center gap-1.5 cursor-pointer group"
                title="Importar respaldo (.json)"
              >
                <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-blue-400 group-hover:translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Importar</span>
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

        <SummaryBar entries={entries} currency={currency} />

        <DebtForm
          names={names}
          currency={currency}
          onAdd={addEntry}
          onAddToExisting={handleAddToExisting}
        />

        <DebtList
          entries={entries}
          currency={currency}
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
        currency={currency}
        onClose={() => setDetailId(null)}
        onAddPago={(id, amount, note) => addToExisting(id, amount, "pago-parcial", note)}
        onAddIncremento={(id, amount, note) => addToExisting(id, amount, "incremento", note)}
        onUpdateEntry={updateEntry}
      />

      <ExportModal
        open={exportModalOpen}
        currency={currency}
        onClose={() => setExportModalOpen(false)}
        onExportJson={handleExportJson}
        onExportExcel={handleExportExcel}
      />

      <CurrencyModal
        open={currencyModalOpen}
        currentCurrency={currency}
        onSelectCurrency={(code) => {
          setCurrency(code)
          showToast(`Moneda cambiada a ${code}`)
        }}
        onClose={() => setCurrencyModalOpen(false)}
      />

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
