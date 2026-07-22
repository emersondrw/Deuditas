import { useEffect } from "react"

interface Props {
  open: boolean
  onClose: () => void
}

export function InfoModal({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-[#0b0b0b] border-t border-border-custom sm:border rounded-t-xl sm:rounded-xl p-6 animate-slide-up shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">Cómo funciona</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-sm text-white/70 font-body">
          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Dato
            </h3>
            <p>Registra quién te debe o a quién le debes. Elige el tipo, escribe el nombre y el monto. Si la persona ya existe, se suma automáticamente a su deuda actual.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar / Reabrir
            </h3>
            <p>Marca una deuda como pagada desde la tarjeta. Si fue error, puedes reabrirla.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Detalle
            </h3>
            <p>Dentro de cada deuda puedes ver el historial completo, registrar pagos parciales o incrementar el monto.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Exportar / Importar
            </h3>
            <p>Exporta tus datos en formato JSON para guardar respaldos o genera un documento Excel (.xlsx) con todos tus registros agrupados y ordenados por nombre.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <span className="text-text-secondary text-base leading-none">ℹ</span>
              Privacidad
            </h3>
            <p>Todo se guarda en tu navegador. No hay servidores ni cuentas. Tus datos nunca salen de tu dispositivo.</p>
          </section>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-md text-sm font-semibold bg-white text-[#0b0b0b] hover:bg-white/90 transition-colors font-body ledger-btn"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
