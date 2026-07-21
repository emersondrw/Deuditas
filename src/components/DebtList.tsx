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
      <div className="text-center py-12 text-neutral-500">
        <p className="text-lg">Sin deudas</p>
        <p className="text-sm mt-1">Agrega tu primera deuda arriba</p>
      </div>
    )
  }

  return (
    <div>
      {activos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3 px-1">
            Activos ({activos.length})
          </h2>
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
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3 px-1">
            Pagados ({pagados.length})
          </h2>
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
