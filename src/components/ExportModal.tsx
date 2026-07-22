/**
 * @description       : Modal component allowing users to choose export format (JSON backup or Excel spreadsheet).
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-07-21
 **/
import { useEffect } from "react"

interface Props {
  open: boolean
  onClose: () => void
  onExportJson: () => void
  onExportExcel: () => void
}

export function ExportModal({ open, onClose, onExportJson, onExportExcel }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-[#0b0b0b] border-t border-border-custom sm:border rounded-t-xl sm:rounded-xl p-6 animate-slide-up shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-white">Exportar registros</h2>
            <p className="text-xs text-text-secondary font-body mt-0.5">
              Selecciona el formato en el que deseas descargar tu información
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 mt-5">
          {/* Opción JSON */}
          <button
            onClick={() => {
              onExportJson()
              onClose()
            }}
            className="w-full text-left p-4 rounded-xl border border-border-custom/80 bg-[#141414] hover:bg-[#1c1c1c] hover:border-text-secondary/40 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-accent-owed shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-body font-medium text-sm text-white group-hover:text-accent-owed transition-colors">
                    Respaldo JSON
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-text-secondary border border-border-custom">
                    .json
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 font-body leading-relaxed">
                  Para importar y restaurar tus deudas completas en otra instancia de Deuditas.
                </p>
              </div>
            </div>
          </button>

          {/* Opción Excel */}
          <button
            onClick={() => {
              onExportExcel()
              onClose()
            }}
            className="w-full text-left p-4 rounded-xl border border-border-custom/80 bg-[#141414] hover:bg-[#1c1c1c] hover:border-text-secondary/40 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-accent-owed shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-body font-medium text-sm text-white group-hover:text-accent-owed transition-colors">
                    Formato Excel (.xlsx)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-emerald-400/90 border border-emerald-500/20">
                    .xlsx
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 font-body leading-relaxed">
                  Organizado por hojas de resumen y detalle, agrupado y ordenado por nombre.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
