/**
 * data912.com API Types
 * Free market data API for Argentine financial instruments
 */

/**
 * Live market data response from data912 API
 */
export interface Data912Instrument {
  symbol: string // Ticker symbol
  px_bid: number | null // Bid price (compra)
  px_ask: number | null // Ask price (venta)
  q_bid: number | null // Bid quantity
  q_ask: number | null // Ask quantity
  c: number | null // Close price
  v: number | null // Volume
  q_op: number | null // Open quantity
  pct_change: number | null // Percentage change
}

/**
 * Instrument categories supported by data912
 */
export type InstrumentCategory =
  | 'cedear' // CEDEARs (Argentine stock market certificates)
  | 'bond' // Sovereign bonds
  | 'corp' // Corporate bonds
  | 'stock' // Local stocks
  | 'note' // Government notes
  | 'fci' // Investment funds (not available via API)

/**
 * API endpoints for different instrument types
 */
export const DATA912_ENDPOINTS = {
  cedears: 'https://data912.com/live/arg_cedears',
  bonds: 'https://data912.com/live/arg_bonds',
  corp: 'https://data912.com/live/arg_corp',
  stocks: 'https://data912.com/live/arg_stocks',
  notes: 'https://data912.com/live/arg_notes',
} as const

/**
 * Cached price data with timestamp
 */
export interface CachedPrice {
  price: number
  timestamp: number
  source: 'api' | 'manual'
}

/**
 * Price cache stored in localStorage
 */
export type PriceCache = Record<string, CachedPrice>
