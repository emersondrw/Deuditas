/**
 * @description       : Segmented tab selector to switch between Personal Debts and Group Trips.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

export type AppTab = "personal" | "trips"

interface Props {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
  activeTripsCount?: number
}

export function TripTabSelector({ activeTab, onSelectTab, activeTripsCount = 0 }: Props) {
  return (
    <div className="w-full bg-[#121212] p-1 rounded-xl border border-border-custom mb-6 flex items-center gap-1 shadow-inner select-none">
      <button
        onClick={() => onSelectTab("personal")}
        className={`
          flex-1 py-2 px-3 rounded-lg text-xs font-body font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
          ${
            activeTab === "personal"
              ? "bg-[#222222] text-white shadow-sm border border-white/10 font-semibold"
              : "text-text-secondary hover:text-white/80 hover:bg-[#181818]"
          }
        `}
      >
        <span className="text-sm">💳</span>
        <span>Deudas Personales</span>
      </button>

      <button
        onClick={() => onSelectTab("trips")}
        className={`
          flex-1 py-2 px-3 rounded-lg text-xs font-body font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer relative
          ${
            activeTab === "trips"
              ? "bg-gradient-to-r from-[#0d3b4c] to-[#0f4c42] text-cyan-200 shadow-sm border border-cyan-500/30 font-semibold"
              : "text-text-secondary hover:text-white/80 hover:bg-[#181818]"
          }
        `}
      >
        <span className="text-sm">🏖️</span>
        <span>Viajes & Grupos</span>
        {activeTripsCount > 0 && (
          <span
            className={`
              text-[10px] font-mono px-1.5 py-0.2 rounded-full
              ${
                activeTab === "trips"
                  ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 font-bold"
                  : "bg-[#262626] text-text-secondary border border-border-custom"
              }
            `}
          >
            {activeTripsCount}
          </span>
        )}
      </button>
    </div>
  )
}
