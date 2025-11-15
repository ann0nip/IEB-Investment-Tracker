import useSWR from 'swr'
import { fetchMultipleTickers } from '../api/data912-client'
import { getTickerCategory, isTickerApiAvailable } from '../constants/ticker-mapping'

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Fetcher function for SWR
 * Fetches prices for multiple tickers
 * @param key - SWR key array: ['market-prices', ...tickers]
 */
async function fetcher(key: string[]): Promise<Record<string, number | null>> {
  // Extract tickers from key (skip first element which is 'market-prices')
  const tickers = key.slice(1)

  // Filter to only API-available tickers
  const apiTickers = tickers.filter(isTickerApiAvailable)

  if (apiTickers.length === 0) {
    return {}
  }

  // Group by category
  const tickersByCategory = apiTickers
    .map(ticker => {
      const category = getTickerCategory(ticker)
      if (!category || category === 'fci') return null
      return {
        ticker,
        category: category as Exclude<typeof category, 'fci' | undefined>,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (tickersByCategory.length === 0) {
    return {}
  }

  try {
    const results = await fetchMultipleTickers(tickersByCategory)
    if (process.env.NODE_ENV === 'development') {
      console.log('[useMarketPrices] Fetched prices:', results)
    }
    return results
  } catch (error) {
    console.error('Error fetching prices:', error)
    return {}
  }
}

/**
 * Hook for managing market prices from data912 API using SWR
 */
export function useMarketPrices(tickers: string[]) {
  // Create a stable key for SWR
  const key = tickers.length > 0 ? ['market-prices', ...tickers.sort()] : null

  const { data, error, isLoading, mutate } = useSWR<Record<string, number | null>>(key, fetcher, {
    // Revalidate every 5 minutes
    refreshInterval: CACHE_DURATION,
    // Don't revalidate on focus (to avoid too many requests)
    revalidateOnFocus: false,
    // Don't revalidate on reconnect (to avoid too many requests)
    revalidateOnReconnect: false,
  })

  // Debug: log SWR state
  if (process.env.NODE_ENV === 'development') {
    console.log('[useMarketPrices] SWR state:', {
      hasKey: !!key,
      keyLength: key?.length,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      isLoading,
      error: error?.message,
    })
  }

  /**
   * Get price for a specific ticker
   */
  const getPrice = (ticker: string): number | null => {
    if (!data) {
      // Debug: log when data is not available
      if (process.env.NODE_ENV === 'development') {
        console.log(`[useMarketPrices] No data available for ticker: ${ticker}`)
      }
      return null
    }
    const normalizedTicker = ticker.toUpperCase()
    const price = data[normalizedTicker] ?? null
    // Debug: log price lookup
    if (process.env.NODE_ENV === 'development' && price === null) {
      console.log(
        `[useMarketPrices] Price not found for ticker: ${ticker} (normalized: ${normalizedTicker}), available keys:`,
        Object.keys(data)
      )
    }
    return price
  }

  /**
   * Get all prices
   */
  const getAllPrices = (): Record<string, number | null> => {
    return data ?? {}
  }

  /**
   * Manually refresh prices
   */
  const refreshPrices = async () => {
    await mutate()
  }

  /**
   * Check if a ticker is loading
   */
  const isLoadingTicker = (ticker: string): boolean => {
    return isLoading
  }

  /**
   * Get cache age in minutes (approximate, based on SWR's internal cache)
   */
  const getCacheAge = (ticker: string): number | null => {
    // SWR doesn't expose cache age directly, so we return null
    // The cache is managed by SWR internally
    return null
  }

  return {
    // State
    prices: data ?? {},
    loading: isLoading,
    error,
    isLoadingTicker,

    // Methods
    getPrice,
    getAllPrices,
    refreshPrices,
    mutate,
    getCacheAge,
  }
}
