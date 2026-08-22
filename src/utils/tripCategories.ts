/**
 * @description       : Definition of trip and tourist categories, beach activities, icons, and helper utilities.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

export interface TripCategory {
  id: string
  name: string
  icon: string
  description: string
  color: string
  suggestions: string[]
}

export const TRIP_CATEGORIES: TripCategory[] = [
  {
    id: "playa",
    name: "Playa & Alquileres",
    icon: "🏖️",
    description: "Toldos, sombrillas, reposeras, cuatrimotos, motos de agua, kayaks",
    color: "#06b6d4",
    suggestions: [
      "Alquiler de toldo y sombrilla",
      "Reposeras en la playa",
      "Paseo en moto acuática",
      "Alquiler de cuatrimotos",
      "Lockers de playa",
    ],
  },
  {
    id: "comida",
    name: "Comida & Beach Clubs",
    icon: "🍹",
    description: "Cevicherías, restaurantes de playa, tragos, hielos, snacks",
    color: "#f59e0b",
    suggestions: [
      "Almuerzo marino / Cevichería",
      "Consumo en Beach Club",
      "Tragos y cervezas para la playa",
      "Bolsa de hielo y snacks",
      "Cena grupal en el centro",
    ],
  },
  {
    id: "hospedaje",
    name: "Hospedaje & Estancia",
    icon: "🏨",
    description: "Casa de playa, Airbnb, hotel, resort, depósitos de garantía",
    color: "#3b82f6",
    suggestions: [
      "Reserva de casa de playa / Airbnb",
      "Noche de hotel / resort",
      "Depósito de garantía",
      "Tasa turística de hospedaje",
      "Servicio de limpieza",
    ],
  },
  {
    id: "tours",
    name: "Tours & Actividades",
    icon: "🚤",
    description: "Paseos en lancha/yate, snorkel, buceo, parques acuáticos, guías",
    color: "#8b5cf6",
    suggestions: [
      "Paseo en lancha / Yate",
      "Tour de snorkel y tortugas",
      "Entradas a parque turístico / acuático",
      "Guía turístico local",
      "Clase de surf o buceo",
    ],
  },
  {
    id: "transporte",
    name: "Transporte & Ruta",
    icon: "🚗",
    description: "Combustible, peajes, vans grupales, taxis, traslados al aeropuerto",
    color: "#10b981",
    suggestions: [
      "Combustible para el viaje",
      "Peajes de carretera",
      "Van grupal / Traslado aeropuerto",
      "Taxi / Uber turístico",
      "Estacionamiento cerca de la playa",
    ],
  },
  {
    id: "compras",
    name: "Supermercado & Víveres",
    icon: "🛒",
    description: "Compras para la casa, víveres, carbón para parrilla, bloqueadores",
    color: "#ec4899",
    suggestions: [
      "Compras de supermercado para la casa",
      "Carbón y carne para la parrilla",
      "Agua embotellada y refrescos",
      "Bloqueadores solares y repelente",
      "Desayuno grupal",
    ],
  },
  {
    id: "souvenirs",
    name: "Recuerdos & Farmacia",
    icon: "🛍️",
    description: "Artesanías, recuerdos, farmacia, propinas grupales, emergencias",
    color: "#f43f5e",
    suggestions: [
      "Farmacia (antimareos / gel post-solar)",
      "Recuerdos y artesanías locales",
      "Propina grupal a mesero/guía",
      "Artículos olvidados (sandalias/gafas)",
      "Emergencia o imprevisto",
    ],
  },
  {
    id: "otro",
    name: "General / Otro",
    icon: "💡",
    description: "Otros gastos compartidos del viaje",
    color: "#888888",
    suggestions: [
      "Gasto general del viaje",
      "Fondo común de imprevistos",
      "Aporte libre de grupo",
    ],
  },
]

/**
 * @description       : Retrieves category information by ID with fallback to general category.
 * @param categoryId  : Unique category identifier.
 * @return            : TripCategory object with icons and metadata.
 **/
export function getTripCategoryInfo(categoryId?: string): TripCategory {
  if (!categoryId) return TRIP_CATEGORIES[0]
  return TRIP_CATEGORIES.find(c => c.id.toLowerCase() === categoryId.toLowerCase()) || TRIP_CATEGORIES[0]
}

export const AVATAR_PALETTE = [
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#14b8a6", // Teal
  "#eab308", // Yellow
  "#6366f1", // Indigo
]

/**
 * @description       : Picks a consistent avatar color for a participant name or ID.
 * @param key         : String to hash/pick color from.
 * @return            : Hex color string.
 **/
export function getAvatarColor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[index]
}
