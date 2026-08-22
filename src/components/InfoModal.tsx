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
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Multi-moneda y Moneda por Deuda
            </h3>
            <p>Puedes definir la moneda global desde el encabezado y también elegir una divisa específica por deuda (PEN, USD, EUR, etc.). La barra de resumen desglosa los totales por moneda automáticamente.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <span className="text-sm">🏷️</span>
              Categorías y Vencimientos
            </h3>
            <p>Clasifica tus deudas por motivo (Comida, Préstamo, Hogar, Transporte, Compras) y establece fechas límites de pago con avisos visuales automáticos cuando estén por vencer o vencidas.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <span className="text-sm">🏖️</span>
              Viajes en Grupo & Liquidación
            </h3>
            <p>Organiza viajes de playa y centros turísticos con tus amigos. Registra consumos compartidos (toldos, cevichería, Airbnb, lanchas, víveres) y Deuditas calculará el número mínimo de transferencias para saldar todo en WhatsApp y Excel.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.179-.548-1.503-.63-2.47-2.164-2.545-2.264-.074-.101-.611-.813-.611-1.55 0-.737.387-1.1.524-1.25.137-.15.3-.187.4-.187.1 0 .2.001.288.006.096.005.225-.036.35.265.13.313.443 1.077.481 1.157.039.08.065.174.013.279-.053.104-.08.169-.158.26-.079.091-.166.203-.237.272-.08.077-.164.16-.07.322.094.162.417.689.897 1.116.618.55 1.139.721 1.301.802.162.08.257.07.353-.04.096-.11.411-.478.521-.642.11-.164.22-.137.369-.082.15.055.952.449 1.116.531.164.082.274.123.314.192.04.068.04.397-.104.802z" />
              </svg>
              Recordatorio por WhatsApp
            </h3>
            <p>Desde el detalle de cualquier deuda puedes presionar "Recordar por WhatsApp" para enviar un mensaje cordial y prearmado con el monto y motivo exacto.</p>
          </section>

          <section>
            <h3 className="font-medium text-white mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Instalar en tu Móvil (iOS y Android)
            </h3>
            <p className="space-y-1">
              <span className="block">• <strong>iPhone (iOS):</strong> En Safari, toca el botón <em>Compartir</em> y selecciona <em>"Agregar a pantalla de inicio"</em>.</span>
              <span className="block">• <strong>Android:</strong> En Chrome, toca el menú de 3 puntos y pulsa <em>"Instalar aplicación"</em>.</span>
              <span className="block text-text-secondary text-xs">Funciona 100% offline sin necesidad de conexión.</span>
            </p>
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
