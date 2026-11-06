import type { Producto } from '../types'

export function isProducto(value: unknown): value is Producto {
  if (!value || typeof value !== 'object') return false

  const item = value as Record<string, unknown>
  const image = item.image as Record<string, unknown> | null

  return (
    Number.isSafeInteger(item.id) &&
    (item.id as number) > 0 &&
    typeof item.name === 'string' &&
    typeof item.category === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    image !== null &&
    typeof image === 'object' &&
    typeof image.thumbnail === 'string' &&
    typeof image.desktop === 'string'
  )
}
