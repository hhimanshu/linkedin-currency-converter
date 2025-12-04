import Papa from 'papaparse';
import type { ExchangeRateMap } from '../types/currency.types';
import exchangeRatesCSV from '../../data/exchange_rates_with_iso.csv';

/**
 * Parse CSV and create exchange rate lookup map
 * This runs ONCE at module initialization time
 */
function initializeExchangeRates(): ExchangeRateMap {
  const parseResult = Papa.parse<string[]>(exchangeRatesCSV, {
    header: false,
    skipEmptyLines: true,
  });

  const rateMap = new Map<string, number>();

  // Skip header row (index 0), start from index 1
  for (let i = 1; i < parseResult.data.length; i++) {
    const row = parseResult.data[i];

    // CSV structure: Record Date, Country-Currency, Exchange Rate, Effective Date, ISO Code
    if (row.length >= 5) {
      const isoCode = row[4].trim().toUpperCase();
      const exchangeRate = parseFloat(row[2]);

      // Only store valid entries
      if (isoCode && !isNaN(exchangeRate)) {
        // For duplicate ISO codes (like BWP with multiple dates),
        // we'll use the first occurrence (most recent in our case)
        if (!rateMap.has(isoCode)) {
          rateMap.set(isoCode, exchangeRate);
        }
      }
    }
  }

  // Always include USD with rate 1.0
  rateMap.set('USD', 1.0);

  return rateMap;
}

// Module-level cache - initialized once when worker loads
const exchangeRates: ExchangeRateMap = initializeExchangeRates();

/**
 * Get exchange rate for a currency code
 * @param currencyCode - ISO currency code (e.g., "EUR")
 * @returns Exchange rate or undefined if not found
 */
export function getExchangeRate(currencyCode: string): number | undefined {
  return exchangeRates.get(currencyCode.toUpperCase());
}

/**
 * Check if a currency code is supported
 */
export function isCurrencySupported(currencyCode: string): boolean {
  return exchangeRates.has(currencyCode.toUpperCase());
}

/**
 * Get all supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Array.from(exchangeRates.keys());
}

/**
 * Get the count of loaded exchange rates
 */
export function getExchangeRateCount(): number {
  return exchangeRates.size;
}
