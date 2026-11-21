/**
 * @description       : List of consolidated accounts grouped by person with net balances per currency.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-11-21
 * @last modified by  : Emerson VI
 **/

import type { PersonAccount } from "../types"
import { formatCurrency } from "../utils/format"
import { getPersonAvatarClass, getPersonInitials } from "../utils/personAccounts"

interface Props {
  accounts: PersonAccount[]
  currency?: string
  onOpenPerson: (key: string) => void
}

function getPrimaryCurrency(account: PersonAccount, fallback: string): string | null {
  const codes = Object.keys(account.totals)
  if (codes.length === 0) return null
  const fallbackCode = fallback.toUpperCase()
  return codes.includes(fallbackCode) ? fallbackCode : codes[0]
}

export function PeopleList({ accounts, currency = "PEN", onOpenPerson }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p className="font-display text-xl text-white/30">Sin personas</p>
        <p className="text-sm mt-2 font-body">Agrega tu primera deuda y aquí verás el saldo por persona</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {accounts.map(account => {
        const primaryCode = getPrimaryCurrency(account, currency)
        const primary = primaryCode ? account.totals[primaryCode] : null
        const otherCurrencies = Object.keys(account.totals).filter(code => code !== primaryCode)
        const net = primary?.net ?? 0
        const netLabel = net > 0 ? "te debe" : net < 0 ? "le debes" : "en paz"
        const netClass = net > 0 ? "text-accent-owed" : net < 0 ? "text-accent-owe" : "text-text-secondary"
        const hasBothDirections = Boolean(primary && primary.meDeben > 0 && primary.debo > 0)
        const activeCount = account.activeDebts.length

        return (
          <button
            key={account.key}
            onClick={() => onOpenPerson(account.key)}
            className="w-full ledger-card rounded-lg p-4 text-left transition-all duration-200 hover:bg-surface-hover cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-body text-xs font-semibold shrink-0 ${getPersonAvatarClass(account.name)}`}
              >
                {getPersonInitials(account.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-body font-medium text-sm text-white truncate">
                    {account.name}
                  </h3>
                  {account.overdueCount > 0 && (
                    <span className="text-[9px] font-body px-1.5 py-0.5 rounded border text-red-400 bg-red-500/15 border-red-500/40 shrink-0">
                      {account.overdueCount} vencida{account.overdueCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-secondary font-body mt-0.5">
                  {activeCount > 0
                    ? `${activeCount} deuda${activeCount > 1 ? "s" : ""} activa${activeCount > 1 ? "s" : ""}`
                    : "Sin deudas activas"}
                  {hasBothDirections && primary && (
                    <span className="text-border-custom"> · neto</span>
                  )}
                </p>
                {otherCurrencies.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {otherCurrencies.map(code => (
                      <span
                        key={code}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#202020] text-text-secondary border border-border-custom"
                      >
                        {code} {formatCurrency(Math.abs(account.totals[code].net), code)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                {primary ? (
                  <>
                    <p className={`font-mono text-sm font-semibold tabular-nums ${netClass}`}>
                      {net > 0 ? "+" : net < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(net), primaryCode || currency)}
                    </p>
                    <p className={`text-[10px] font-body mt-0.5 ${netClass}`}>{netLabel}</p>
                  </>
                ) : (
                  <p className="text-[10px] font-body text-text-secondary">en paz</p>
                )}
              </div>

              <svg
                className="w-4 h-4 text-border-custom group-hover:text-text-secondary transition-colors shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )
      })}
    </div>
  )
}
