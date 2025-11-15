import { normalizeTickerForApi } from '../constants/ticker-mapping'
import type { Data912Instrument, InstrumentCategory } from '../types/data912'
import { DATA912_ENDPOINTS } from '../types/data912'

/**
 * Fetch timeout in milliseconds
 */
const FETCH_TIMEOUT = 10000 // 10 seconds

/**
 * Retry configuration
 */
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES
): Promise<Data912Instrument[]> {
  try {
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, retries - 1)
    }
    throw error
  }
}

/**
 * Fetch all instruments for a given category
 */
export async function fetchInstrumentsByCategory(
  category: Exclude<InstrumentCategory, 'fci'>
): Promise<Data912Instrument[]> {
  const endpoint = DATA912_ENDPOINTS[category === 'corp' ? 'corp' : category === 'bond' ? 'bonds' : category === 'stock' ? 'stocks' : category === 'note' ? 'notes' : 'cedears']

  try {
    return await fetchWithRetry(endpoint)
  } catch (error) {
    console.error(`Error fetching ${category} data from data912:`, error)
    throw new Error(`Failed to fetch ${category} data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Find a specific instrument by ticker symbol
 */
export async function fetchInstrumentByTicker(
  ticker: string,
  category: Exclude<InstrumentCategory, 'fci'>
): Promise<Data912Instrument | null> {
  try {
    const instruments = await fetchInstrumentsByCategory(category)
    const normalizedTicker = normalizeTickerForApi(ticker)
    const instrument = instruments.find((inst) => inst.symbol === normalizedTicker)
    return instrument || null
  } catch (error) {
    console.error(`Error fetching ticker ${ticker}:`, error)
    return null
  }
}

/**
 * Get the best price for an instrument (uses only close price)
 */
export function getBestPrice(instrument: Data912Instrument): number | null {
  // Only use close price, no fallback
  if (instrument.c !== null && instrument.c > 0) {
    return instrument.c
  }

  // If no close price available, return null
  return null
}

/**
 * Fetch multiple tickers at once (batched by category)
 */
export async function fetchMultipleTickers(
  tickers: Array<{ ticker: string; category: Exclude<InstrumentCategory, 'fci'> }>
): Promise<Record<string, number | null>> {
  // Group by category to minimize API calls
  // Keep original ticker as key, but use normalized for API
  const byCategory = tickers.reduce(
    (acc, { ticker, category }) => {
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        original: ticker.toUpperCase(),
        normalized: normalizeTickerForApi(ticker),
      })
      return acc
    },
    {} as Record<string, Array<{ original: string; normalized: string }>>
  )

  const results: Record<string, number | null> = {}

  // Fetch each category in parallel
  await Promise.all(
    Object.entries(byCategory).map(async ([category, tickerList]) => {
      try {
        const instruments = await fetchInstrumentsByCategory(
          category as Exclude<InstrumentCategory, 'fci'>
        )

        tickerList.forEach(({ original, normalized }) => {
          const instrument = instruments.find((inst) => inst.symbol === normalized)
          results[original] = instrument ? getBestPrice(instrument) : null
        })
      } catch {
        // On error, set all tickers in this category to null
        tickerList.forEach(({ original }) => {
          results[original] = null
        })
      }
    })
  )

  return results
}
