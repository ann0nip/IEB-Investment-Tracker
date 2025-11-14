import type { InstrumentCategory } from '../types/data912'

/**
 * Maps ticker symbols to their instrument category
 * Used to determine which data912 API endpoint to call
 */
export const TICKER_CATEGORY_MAP: Record<string, InstrumentCategory> = {
  // CEDEARs - Equities Growth
  AMZND: 'cedear',
  MSFTD: 'cedear',
  JPMD: 'cedear',
  XLFD: 'cedear',
  GSD: 'cedear',

  // CEDEARs - Equities Value/Defensivos
  UNHD: 'cedear',
  XLVD: 'cedear',
  CATD: 'cedear',
  PFED: 'cedear',
  BIIBD: 'cedear',
  MMMD: 'cedear',
  DIAD: 'cedear',
  JNJD: 'cedear',

  // Acciones (disponibles en stocks)
  YPFDD: 'stock',
  PAMPD: 'stock',
  TXARD: 'stock',

  // Fixed Income Corporativo - Obligaciones Negociables
  YM39D: 'corp',
  YMCID: 'corp',

  // Soberanos (Sovereign Bonds)
  GD30D: 'bond',
  GD35D: 'bond',

  // FCI - Not available via API
  'Ciclo Nova II Clase A': 'fci',
}

/**
 * Get the category for a given ticker
 */
export function getTickerCategory(ticker: string): InstrumentCategory | undefined {
  // Normalize ticker to uppercase for lookup
  const normalized = ticker.toUpperCase()
  return TICKER_CATEGORY_MAP[normalized] ?? TICKER_CATEGORY_MAP[ticker]
}

/**
 * Check if ticker is available via API (not FCI)
 */
export function isTickerApiAvailable(ticker: string): boolean {
  const category = getTickerCategory(ticker)
  return category !== undefined && category !== 'fci'
}

/**
 * Normalize ticker symbol for API calls
 * Simply uppercase the ticker - data912 API already has the correct format
 */
export function normalizeTickerForApi(ticker: string): string {
  return ticker.toUpperCase()
}
