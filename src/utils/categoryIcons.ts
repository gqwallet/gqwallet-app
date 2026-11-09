/**
 * Icon of each seeded category (Annex A); user categories fall back to a tag.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

const ICONS: Record<string, string> = {
  'Accesorios y tecnología': 'devices',
  'Bares y discotecas': 'nightlife',
  Cafeterías: 'local_cafe',
  'Chatarra y golosinas': 'cookie',
  'Citas médicas': 'stethoscope',
  'Comida y restaurantes': 'restaurant',
  'Cuidado personal': 'spa',
  Educación: 'school',
  Entretenimiento: 'movie',
  'Gastos financieros': 'account_balance',
  'Hogar y decoración': 'chair',
  Mascotas: 'pets',
  Medicina: 'medication',
  Movilidad: 'directions_car',
  Productividad: 'work',
  Retiros: 'local_atm',
  'Ropa y calzado': 'checkroom',
  'Salud y bienestar': 'favorite',
  Servicios: 'bolt',
  Supermercado: 'shopping_cart',
  Suscripciones: 'subscriptions',
  Sueldo: 'payments',
  Aguinaldo: 'redeem',
  Ventas: 'storefront',
  Inversiones: 'trending_up',
  Remesas: 'send_money',
  'Transferencias recibidas': 'move_to_inbox',
  Préstamos: 'request_quote',
  'Otros ingresos': 'add_card',
};

/**
 * Returns the icon of a category by name.
 *
 * @param name - Category name.
 * @returns Icon ligature; `sell` for unknown names.
 * @example
 * ```ts
 * categoryIcon('Movilidad'); // 'directions_car'
 * ```
 */
export function categoryIcon(name: string): string {
  return ICONS[name] ?? 'sell';
}
