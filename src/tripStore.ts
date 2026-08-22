/**
 * @description       : State management and persistence layer for group trips, tourist expenses, and settlements.
 * @group             : State
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState, useCallback } from "react"
import type { Trip, TripExpense, TripParticipant, SplitMethod, ExpenseSplit } from "./tripTypes"
import { generateId, todayISO } from "./utils/format"
import { getAvatarColor } from "./utils/tripCategories"

const TRIPS_STORAGE_KEY = "deuditas-trips"
const EXPENSES_STORAGE_KEY = "deuditas-trip-expenses"

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(TRIPS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as Trip[]
    }
  } catch { /* ignore */ }
  return []
}

function loadExpenses(): TripExpense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as TripExpense[]
    }
  } catch { /* ignore */ }
  return []
}

function saveTrips(trips: Trip[]) {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips))
}

function saveExpenses(expenses: TripExpense[]) {
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))
}

export function useTripStore() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips)
  const [expenses, setExpenses] = useState<TripExpense[]>(loadExpenses)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  const persistTrips = useCallback((next: Trip[]) => {
    setTrips(next)
    saveTrips(next)
  }, [])

  const persistExpenses = useCallback((next: TripExpense[]) => {
    setExpenses(next)
    saveExpenses(next)
  }, [])

  /**
   * @description       : Creates a new group trip with participants.
   **/
  const createTrip = useCallback((
    name: string,
    destination: string,
    currency: string,
    participantNames: string[],
    options?: {
      startDate?: string
      endDate?: string
      budget?: number
    }
  ): Trip => {
    const now = todayISO()
    const tripId = generateId()
    const participants: TripParticipant[] = participantNames
      .map(n => n.trim())
      .filter(Boolean)
      .map(name => {
        const id = generateId()
        return {
          id,
          name: name.toUpperCase(),
          avatarColor: getAvatarColor(name),
        }
      })

    const newTrip: Trip = {
      id: tripId,
      name: name.trim(),
      destination: destination.trim(),
      currency: currency.trim().toUpperCase(),
      startDate: options?.startDate || now.slice(0, 10),
      endDate: options?.endDate,
      budget: options?.budget,
      participants,
      status: "activo",
      createdAt: now,
    }

    const next = [newTrip, ...trips]
    persistTrips(next)
    setSelectedTripId(tripId)
    return newTrip
  }, [trips, persistTrips])

  /**
   * @description       : Updates an existing trip's properties.
   **/
  const updateTrip = useCallback((
    tripId: string,
    updates: Partial<Omit<Trip, "id" | "createdAt" | "participants">>
  ) => {
    const next = trips.map(t => {
      if (t.id !== tripId) return t
      return {
        ...t,
        ...updates,
      }
    })
    persistTrips(next)
  }, [trips, persistTrips])

  /**
   * @description       : Deletes a trip and all its associated expenses.
   **/
  const deleteTrip = useCallback((tripId: string) => {
    const nextTrips = trips.filter(t => t.id !== tripId)
    const nextExpenses = expenses.filter(e => e.tripId !== tripId)
    persistTrips(nextTrips)
    persistExpenses(nextExpenses)
    if (selectedTripId === tripId) {
      setSelectedTripId(null)
    }
  }, [trips, expenses, selectedTripId, persistTrips, persistExpenses])

  /**
   * @description       : Adds a new participant to a trip.
   **/
  const addParticipant = useCallback((tripId: string, name: string) => {
    const cleanName = name.trim().toUpperCase()
    if (!cleanName) return

    const next = trips.map(t => {
      if (t.id !== tripId) return t
      const exists = t.participants.some(p => p.name === cleanName)
      if (exists) return t
      const newParticipant: TripParticipant = {
        id: generateId(),
        name: cleanName,
        avatarColor: getAvatarColor(cleanName),
      }
      return {
        ...t,
        participants: [...t.participants, newParticipant],
      }
    })
    persistTrips(next)
  }, [trips, persistTrips])

  /**
   * @description       : Removes a participant from a trip if they have no active expenses.
   **/
  const removeParticipant = useCallback((tripId: string, participantId: string) => {
    const next = trips.map(t => {
      if (t.id !== tripId) return t
      return {
        ...t,
        participants: t.participants.filter(p => p.id !== participantId),
      }
    })
    persistTrips(next)
  }, [trips, persistTrips])

  /**
   * @description       : Adds an expense to a trip and auto-calculates splits based on the chosen method.
   **/
  const addExpense = useCallback((
    tripId: string,
    params: {
      title: string
      amount: number
      currency: string
      paidById: string
      categoryId: string
      location?: string
      date?: string
      notes?: string
      splitMethod: SplitMethod
      splits?: ExpenseSplit[]
      tipAmount?: number
    }
  ) => {
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return

    const now = todayISO()
    let computedSplits: ExpenseSplit[] = []

    if (params.splitMethod === "equal") {
      const count = trip.participants.length
      const perPerson = count > 0 ? params.amount / count : params.amount
      computedSplits = trip.participants.map(p => ({
        participantId: p.id,
        amount: perPerson,
        included: true,
      }))
    } else if (params.splitMethod === "selected") {
      const rawSplits = params.splits || []
      const included = rawSplits.filter(s => s.included)
      const count = included.length > 0 ? included.length : 1
      const perPerson = params.amount / count
      computedSplits = trip.participants.map(p => {
        const isInc = rawSplits.some(s => s.participantId === p.id && s.included)
        return {
          participantId: p.id,
          amount: isInc ? perPerson : 0,
          included: isInc,
        }
      })
    } else {
      // custom
      computedSplits = params.splits || trip.participants.map(p => ({
        participantId: p.id,
        amount: 0,
        included: false,
      }))
    }

    const newExpense: TripExpense = {
      id: generateId(),
      tripId,
      title: params.title.trim(),
      amount: params.amount,
      currency: params.currency.trim().toUpperCase(),
      paidById: params.paidById,
      categoryId: params.categoryId,
      location: params.location?.trim() || undefined,
      date: params.date || now.slice(0, 10),
      notes: params.notes?.trim() || undefined,
      splitMethod: params.splitMethod,
      splits: computedSplits,
      tipAmount: params.tipAmount,
      createdAt: now,
    }

    persistExpenses([newExpense, ...expenses])
  }, [trips, expenses, persistExpenses])

  /**
   * @description       : Updates an existing trip expense.
   **/
  const updateExpense = useCallback((
    expenseId: string,
    params: {
      title?: string
      amount?: number
      currency?: string
      paidById?: string
      categoryId?: string
      location?: string
      date?: string
      notes?: string
      splitMethod?: SplitMethod
      splits?: ExpenseSplit[]
      tipAmount?: number
    }
  ) => {
    const next = expenses.map(e => {
      if (e.id !== expenseId) return e
      const trip = trips.find(t => t.id === e.tripId)
      const finalAmount = params.amount !== undefined ? params.amount : e.amount
      const finalSplitMethod = params.splitMethod || e.splitMethod

      let computedSplits = params.splits || e.splits
      if (trip && params.splitMethod === "equal") {
        const count = trip.participants.length
        const perPerson = count > 0 ? finalAmount / count : finalAmount
        computedSplits = trip.participants.map(p => ({
          participantId: p.id,
          amount: perPerson,
          included: true,
        }))
      } else if (trip && params.splitMethod === "selected" && params.splits) {
        const included = params.splits.filter(s => s.included)
        const count = included.length > 0 ? included.length : 1
        const perPerson = finalAmount / count
        computedSplits = trip.participants.map(p => {
          const isInc = params.splits?.some(s => s.participantId === p.id && s.included) ?? false
          return {
            participantId: p.id,
            amount: isInc ? perPerson : 0,
            included: isInc,
          }
        })
      }

      return {
        ...e,
        title: params.title !== undefined ? params.title.trim() : e.title,
        amount: finalAmount,
        currency: params.currency !== undefined ? params.currency.trim().toUpperCase() : e.currency,
        paidById: params.paidById || e.paidById,
        categoryId: params.categoryId || e.categoryId,
        location: params.location !== undefined ? (params.location.trim() || undefined) : e.location,
        date: params.date || e.date,
        notes: params.notes !== undefined ? (params.notes.trim() || undefined) : e.notes,
        splitMethod: finalSplitMethod,
        splits: computedSplits,
        tipAmount: params.tipAmount !== undefined ? params.tipAmount : e.tipAmount,
      }
    })
    persistExpenses(next)
  }, [trips, expenses, persistExpenses])

  /**
   * @description       : Deletes an expense by its unique ID.
   **/
  const deleteExpense = useCallback((expenseId: string) => {
    const next = expenses.filter(e => e.id !== expenseId)
    persistExpenses(next)
  }, [expenses, persistExpenses])

  /**
   * @description       : Toggles trip status between active and finalized.
   **/
  const toggleTripStatus = useCallback((tripId: string) => {
    const next = trips.map(t => {
      if (t.id !== tripId) return t
      return {
        ...t,
        status: (t.status === "activo" ? "finalizado" : "activo") as Trip["status"],
      }
    })
    persistTrips(next)
  }, [trips, persistTrips])

  /**
   * @description       : Exports trips and trip expenses as JSON structure for backups.
   **/
  const exportTripData = useCallback(() => {
    return {
      trips,
      tripExpenses: expenses,
    }
  }, [trips, expenses])

  /**
   * @description       : Imports trips and trip expenses from backup object.
   **/
  const importTripData = useCallback((data: { trips?: Trip[]; tripExpenses?: TripExpense[] }) => {
    if (Array.isArray(data.trips)) {
      persistTrips(data.trips)
    }
    if (Array.isArray(data.tripExpenses)) {
      persistExpenses(data.tripExpenses)
    }
  }, [persistTrips, persistExpenses])

  return {
    trips,
    expenses,
    selectedTripId,
    setSelectedTripId,
    createTrip,
    updateTrip,
    deleteTrip,
    addParticipant,
    removeParticipant,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleTripStatus,
    exportTripData,
    importTripData,
  }
}
