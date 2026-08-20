/**
 * @description       : Definition of debt categories, icons, and helper utilities.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-08-19
 **/

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: "general", name: "General / Otro", icon: "💡", description: "Gastos y deudas varias", color: "#888888" },
  { id: "comida", name: "Comida / Salidas", icon: "🍽️", description: "Restaurantes, delivery, salidas", color: "#f59e0b" },
  { id: "prestamo", name: "Préstamo personal", icon: "🤝", description: "Dinero prestado directamente", color: "#3b82f6" },
  { id: "hogar", name: "Hogar / Servicios", icon: "🏠", description: "Alquiler, luz, agua, internet", color: "#10b981" },
  { id: "transporte", name: "Transporte / Viajes", icon: "🚗", description: "Taxis, pasajes, combustible, viajes", color: "#8b5cf6" },
  { id: "compras", name: "Compras compartidas", icon: "🛒", description: "Supermercado, regalos, compras", color: "#ec4899" },
]

export function getCategoryInfo(categoryId?: string): Category {
  if (!categoryId) return CATEGORIES[0]
  return CATEGORIES.find(c => c.id.toLowerCase() === categoryId.toLowerCase()) || CATEGORIES[0]
}
