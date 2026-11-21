/**
 * @description       : Consolidated person account view: net balances, automatic payment allocation, debt list, history and statements.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-11-21
 * @last modified by  : Emerson VI
 **/

import { useEffect, useState } from "react"
import type { DebtType, PersonAccount } from "../types"
import { formatCurrency, formatShortDate, getCurrencyInfo, getDebtStatus, getDueDateStatus } from "../utils/format"
import { getCategoryInfo } from "../utils/categories"
import {
  generatePersonStatementText,
  getPersonAvatarClass,
  getPersonCurrencies,
  getPersonInitials,
  planPersonPayment,
  printPersonStatement,
} from "../utils/personAccounts"
import { useBodyScrollLock } from "../utils/useBodyScrollLock"

interface Props {
  account: PersonAccount | null
  currency?: string
  onClose: () => void
  onOpenDebt: (id: string) => void
  onTogglePaid: (id: string) => void
  onRegisterPayment: (name: string, amount: number, type: DebtType, currency: string, note?: string) => number
  onToast?: (message: string) => void
}

function formatHistoryDate(value: string): string {
  return new Date(value).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function PersonDetail({
  account,
  currency = "PEN",
  onClose,
  onOpenDebt,
  onTogglePaid,
  onRegisterPayment,
  onToast,
}: Props) {
  const [action, setAction] = useState<DebtType | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [paymentCurrency, setPaymentCurrency] = useState(currency)

  const accountKey = account?.key ?? null

  useBodyScrollLock(Boolean(account))

  useEffect(() => {
    if (accountKey) {
      setAction(null)
      setAmount("")
      setNote("")
      setPaymentCurrency(currency)
    }
  }, [accountKey, currency])

  if (!account) return null

  const canCollect = account.activeDebts.some(debt => debt.type === "me-deben")
  const canPay = account.activeDebts.some(debt => debt.type === "debo")

  const actionCurrencies = action ? getPersonCurrencies(account, action, currency) : []
  const currencyOptions = actionCurrencies.length > 0 ? actionCurrencies : [currency.toUpperCase()]
  const effectiveCurrency = currencyOptions.includes(paymentCurrency.toUpperCase())
    ? paymentCurrency.toUpperCase()
    : currencyOptions[0]
  const currencyInfo = getCurrencyInfo(effectiveCurrency)

  const parsedAmount = Number.parseFloat(amount)
  const plan = action && Number.isFinite(parsedAmount) && parsedAmount > 0
    ? planPersonPayment(account.activeDebts, parsedAmount, action, effectiveCurrency, currency)
    : null

  const history = account.debts
    .flatMap(debt => debt.history.map(item => ({ item, debt })))
    .sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime())
    .slice(0, 40)

  const handleSubmit = () => {
    if (!action || !plan || plan.total <= 0) return
    const applied = onRegisterPayment(account.name, parsedAmount, action, effectiveCurrency, note.trim() || undefined)
    if (applied > 0) {
      setAmount("")
      setNote("")
      setAction(null)
    }
  }

  const handleWhatsApp = () => {
    const text = generatePersonStatementText(account, currency)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatePersonStatementText(account, currency))
      onToast?.("Estado de cuenta copiado")
    } catch {
      onToast?.("No se pudo copiar el estado de cuenta")
    }
  }

  const handlePrint = () => {
    const ok = printPersonStatement(account, currency)
    if (!ok) onToast?.("Permite las ventanas emergentes para imprimir el estado de cuenta")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[88vh] overflow-y-auto bg-[#0b0b0b] border-t border-border-custom sm:border rounded-t-xl sm:rounded-xl p-6 animate-slide-up shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-full border flex items-center justify-center font-body text-sm font-semibold shrink-0 ${getPersonAvatarClass(account.name)}`}
            >
              {getPersonInitials(account.name)}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl text-white truncate">{account.name}</h2>
              <p className="text-[11px] text-text-secondary font-body mt-0.5">
                Estado de cuenta · {account.activeDebts.length} activa{account.activeDebts.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Balances per currency */}
        <div className="space-y-2 mb-4">
          {Object.entries(account.totals).map(([code, totals]) => {
            const netClass = totals.net > 0 ? "text-accent-owed" : totals.net < 0 ? "text-accent-owe" : "text-text-secondary"
            return (
              <div key={code} className="ledger-card rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-text-secondary">{code}</p>
                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1 text-[11px] font-body">
                      <span className="text-accent-owed">
                        Te debe <span className="font-mono font-semibold">{formatCurrency(totals.meDeben, code)}</span>
                      </span>
                      <span className="text-accent-owe">
                        Le debes <span className="font-mono font-semibold">{formatCurrency(totals.debo, code)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-text-secondary font-body">Neto</p>
                    <p className={`font-mono text-sm font-semibold tabular-nums ${netClass}`}>
                      {totals.net > 0 ? "+" : totals.net < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(totals.net), code)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {Object.keys(account.totals).length === 0 && (
            <div className="ledger-card rounded-lg p-4 text-center text-xs text-text-secondary font-body">
              Sin deudas activas. Todo en paz 🎉
            </div>
          )}
        </div>

        {/* Statement actions */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            onClick={handleWhatsApp}
            className="py-2 px-2 rounded-lg bg-[#141414] hover:bg-[#14261b] border border-border-custom hover:border-emerald-500/50 text-text-secondary hover:text-emerald-300 text-[11px] font-body flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Enviar estado de cuenta por WhatsApp"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.179-.548-1.503-.63-2.47-2.164-2.545-2.264-.074-.101-.611-.813-.611-1.55 0-.737.387-1.1.524-1.25.137-.15.3-.187.4-.187.1 0 .2.001.288.006.096.005.225-.036.35.265.13.313.443 1.077.481 1.157.039.08.065.174.013.279-.053.104-.08.169-.158.26-.079.091-.166.203-.237.272-.08.077-.164.16-.07.322.094.162.417.689.897 1.116.618.55 1.139.721 1.301.802.162.08.257.07.353-.04.096-.11.411-.478.521-.642.11-.164.22-.137.369-.082.15.055.952.449 1.116.531.164.082.274.123.314.192.04.068.04.397-.104.802z" />
            </svg>
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCopy}
            className="py-2 px-2 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom hover:border-blue-500/50 text-text-secondary hover:text-blue-300 text-[11px] font-body flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Copiar estado de cuenta"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3M8 13h8M8 17h5" />
            </svg>
            <span>Copiar</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-2 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom hover:border-violet-500/50 text-text-secondary hover:text-violet-300 text-[11px] font-body flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Imprimir o guardar como PDF"
          >
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zM7 9V5a2 2 0 012-2h6a2 2 0 012 2v4" />
            </svg>
            <span>PDF</span>
          </button>
        </div>

        {/* Payment actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => {
              setAction("me-deben")
              setAmount("")
              setNote("")
            }}
            disabled={!canCollect}
            className={`py-2.5 rounded-md text-xs font-medium transition-colors font-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              action === "me-deben"
                ? "bg-accent-owed/10 text-accent-owed border border-accent-owed/25"
                : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
            }`}
          >
            Registrar cobro
          </button>
          <button
            onClick={() => {
              setAction("debo")
              setAmount("")
              setNote("")
            }}
            disabled={!canPay}
            className={`py-2.5 rounded-md text-xs font-medium transition-colors font-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              action === "debo"
                ? "bg-accent-owe/10 text-accent-owe border border-accent-owe/25"
                : "bg-[#222] text-text-secondary border border-border-custom hover:bg-surface-hover"
            }`}
          >
            Registrar pago
          </button>
        </div>

        {/* Payment form */}
        {action && (
          <div className="mb-5 p-4 rounded-lg ledger-card animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body">
                {action === "me-deben" ? "Cobro recibido" : "Pago realizado"}
              </p>
              <button
                onClick={() => {
                  setAction(null)
                  setAmount("")
                  setNote("")
                }}
                className="text-[11px] text-text-secondary hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            {currencyOptions.length > 1 && (
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {currencyOptions.map(code => (
                  <button
                    key={code}
                    onClick={() => setPaymentCurrency(code)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                      code === effectiveCurrency
                        ? "bg-accent-owed/20 text-accent-owed border border-accent-owed/40 font-semibold"
                        : "bg-[#181818] text-text-secondary border border-border-custom hover:text-white hover:bg-[#222]"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}

            <input
              type="number"
              placeholder={`Monto (${currencyInfo.symbol})`}
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
              className="w-full ledger-input rounded-md px-4 py-3 text-sm text-white placeholder-text-secondary/50 font-mono tabular-nums mb-2"
              autoFocus
            />
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
              className="w-full ledger-input rounded-md px-4 py-3 text-sm text-white placeholder-text-secondary/50 font-body mb-3"
            />

            <button
              onClick={handleSubmit}
              disabled={!plan || plan.total <= 0}
              className="w-full py-3 rounded-md text-sm font-semibold bg-white text-[#0b0b0b] hover:bg-white/90 transition-colors font-body ledger-btn cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {action === "me-deben" ? "Aplicar cobro" : "Aplicar pago"}
            </button>

            {plan && plan.allocations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-custom">
                <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-body mb-2">
                  Se aplicará a
                </p>
                <div className="space-y-1.5">
                  {plan.allocations.map(allocation => {
                    const category = getCategoryInfo(allocation.entry.category)
                    return (
                      <div key={allocation.entry.id} className="flex items-center justify-between gap-2 text-[11px] font-body">
                        <span className="text-text-secondary truncate">
                          {category.icon} {category.name}
                        </span>
                        <span className="font-mono text-white/80 shrink-0">
                          {formatCurrency(allocation.amount, effectiveCurrency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {plan.leftover > 0 && (
                  <p className="text-[10px] text-amber-300 mt-2 font-body">
                    Sobran {formatCurrency(plan.leftover, effectiveCurrency)}: no hay más deudas de ese tipo en {effectiveCurrency}.
                  </p>
                )}
              </div>
            )}

            {plan && plan.allocations.length === 0 && parsedAmount > 0 && (
              <p className="text-[10px] text-amber-300 mt-2 font-body">
                No hay deudas activas en {effectiveCurrency} para aplicar este {action === "me-deben" ? "cobro" : "pago"}.
              </p>
            )}
          </div>
        )}

        {/* Active debts */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Deudas activas
            </p>
            <span className="font-mono text-[10px] text-border-custom ml-auto">{account.activeDebts.length}</span>
          </div>

          {account.activeDebts.length === 0 && (
            <p className="text-xs text-text-secondary font-body py-2">No hay deudas activas.</p>
          )}

          {account.activeDebts.map(debt => {
            const status = getDebtStatus(debt)
            const category = getCategoryInfo(debt.category)
            const due = getDueDateStatus(debt.dueDate)
            const code = debt.currency || currency
            return (
              <div key={debt.id} className="ledger-card rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs" title={category.name}>{category.icon}</span>
                      <span className="text-xs text-white/90 font-body truncate">{category.name}</span>
                      {due.status !== "none" && (
                        <span className={`text-[9px] font-body px-1.5 py-0.5 rounded border ${due.badgeClass}`}>
                          {due.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-secondary mt-1 font-mono">
                      {formatShortDate(debt.createdAt)} · {status.label}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-sm font-semibold tabular-nums ${status.colorClass}`}>
                      {formatCurrency(status.displayAmount, code)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <button
                        onClick={() => onOpenDebt(debt.id)}
                        className="text-[10px] text-text-secondary hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-surface-hover font-body cursor-pointer"
                      >
                        Detalle
                      </button>
                      <button
                        onClick={() => onTogglePaid(debt.id)}
                        className="text-[10px] text-text-secondary hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-surface-hover font-body cursor-pointer"
                      >
                        Pagado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Paid debts */}
        {account.paidDebts.length > 0 && (
          <details className="mb-5">
            <summary className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium cursor-pointer select-none py-1">
              Pagadas ({account.paidDebts.length})
            </summary>
            <div className="mt-2 space-y-1.5">
              {account.paidDebts.map(debt => {
                const category = getCategoryInfo(debt.category)
                const code = debt.currency || currency
                return (
                  <div key={debt.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border-custom/50 last:border-0 opacity-60">
                    <span className="text-[11px] text-text-secondary font-body truncate">
                      {category.icon} {category.name} · {formatShortDate(debt.createdAt)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-text-secondary line-through">
                        {formatCurrency(getDebtStatus(debt).displayAmount, code)}
                      </span>
                      <button
                        onClick={() => onTogglePaid(debt.id)}
                        className="text-[10px] text-text-secondary hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-surface-hover font-body cursor-pointer"
                      >
                        Reabrir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )}

        {/* Consolidated history */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Historial consolidado
            </p>
            <span className="font-mono text-[10px] text-border-custom ml-auto">{history.length}</span>
          </div>
          {history.length === 0 && (
            <p className="text-xs text-text-secondary font-body py-2">Sin movimientos.</p>
          )}
          {history.map(({ item, debt }) => {
            const code = item.currency || debt.currency || currency
            const category = getCategoryInfo(debt.category)
            const isPayment = item.type === "pago-parcial"
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-border-custom/50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-white/80 font-body truncate">
                    {category.icon} {isPayment ? "Pago" : item.type === "incremento" ? "Incremento" : "Creación"}
                    {item.note && <span className="text-text-secondary"> — {item.note}</span>}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5 font-mono">
                    {formatHistoryDate(item.date)}
                  </p>
                </div>
                <span className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${isPayment ? "text-accent-owed" : "text-accent-owe"}`}>
                  {isPayment ? "-" : "+"}{formatCurrency(Math.abs(item.amount), code)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
