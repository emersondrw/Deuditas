import type { DebtEntry } from "../types"
import { DebtCard } from "./DebtCard"

interface Props {
  entries: DebtEntry[]
  onTogglePaid: (id: string) => void
  onOpenDetail: (id: string) => void
}

export function DebtList({ entries, onTogglePaid, onOpenDetail }: Props) {
  const activos = entries
    .filter(e => e.status === "activo")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pagados = entries
    .filter(e => e.status === "pagado")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p className="font-display text-xl text-white/30">Sin deudas</p>
        <p className="text-sm mt-2 font-body">Agrega tu primera deuda arriba</p>
      </div>
    )
  }

  return (
    <div>
      {activos.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-owed" />
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Activos
            </h2>
            <span className="font-mono text-[10px] text-border-custom ml-auto">{activos.length}</span>
          </div>
          {activos.map(e => (
            <DebtCard
              key={e.id}
              entry={e}
              onTogglePaid={onTogglePaid}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}

      {pagados.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-border-custom" />
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Pagados
            </h2>
            <span className="font-mono text-[10px] text-border-custom ml-auto">{pagados.length}</span>
          </div>
          {pagados.map(e => (
            <DebtCard
              key={e.id}
              entry={e}
              onTogglePaid={onTogglePaid}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  )
}
