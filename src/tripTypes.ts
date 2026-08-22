/**
 * @description       : Type definitions and interfaces for group trips, tourist expenses, and settlements.
 * @group             : Types
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

export type SplitMethod = "equal" | "selected" | "custom"

export interface TripParticipant {
  id: string
  name: string
  avatarColor?: string
}

export interface ExpenseSplit {
  participantId: string
  amount: number
  included: boolean
}

export interface TripExpense {
  id: string
  tripId: string
  title: string
  amount: number
  currency: string
  paidById: string
  categoryId: string
  location?: string
  date: string
  notes?: string
  splitMethod: SplitMethod
  splits: ExpenseSplit[]
  tipAmount?: number
  createdAt: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate?: string
  currency: string
  budget?: number
  participants: TripParticipant[]
  status: "activo" | "finalizado"
  createdAt: string
}

export interface SettlementTransfer {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
  currency: string
}

export interface ParticipantBalance {
  participantId: string
  participantName: string
  totalPaid: number
  totalOwed: number
  netBalance: number
}
