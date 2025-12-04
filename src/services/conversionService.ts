import { getExchangeRate } from './exchangeRateService';

/**
 * Convert currency amount
 * Supports only USD-based conversions:
 * - USD → Other Currency
 * - Other Currency → USD
 *
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency ISO code
 * @param toCurrency - Target currency ISO code
 * @returns Object with convertedAmount and exchangeRate, or null if conversion not possible
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): { convertedAmount: number; exchangeRate: number } | null {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // If both currencies are the same, no conversion needed
  if (from === to) {
    return {
      convertedAmount: amount,
      exchangeRate: 1.0,
    };
  }

  // Get exchange rates for both currencies
  const fromRate = getExchangeRate(from);
  const toRate = getExchangeRate(to);

  // If either currency is not found, conversion is not possible
  if (fromRate === undefined || toRate === undefined) {
    return null;
  }

  // Check if this is a USD-based conversion
  // Valid: USD → X, X → USD
  // Invalid: X → Y (where neither is USD)
  const isUSDBasedConversion = from === 'USD' || to === 'USD';

  if (!isUSDBasedConversion) {
    // This is a transitive conversion (e.g., EUR → JPY)
    // Not supported per requirements
    return null;
  }

  let convertedAmount: number;
  let effectiveExchangeRate: number;

  if (from === 'USD') {
    // USD → Other Currency
    // Example: 100 USD → EUR where rate is 0.852
    // Result: 100 * 0.852 = 85.2 EUR
    convertedAmount = amount * toRate;
    effectiveExchangeRate = toRate;
  } else {
    // Other Currency → USD
    // Example: 100 EUR → USD where EUR rate is 0.852
    // This means 1 USD = 0.852 EUR, so 1 EUR = 1/0.852 USD
    // Result: 100 / 0.852 = 117.37 USD
    convertedAmount = amount / fromRate;
    effectiveExchangeRate = 1 / fromRate;
  }

  // Round to 2 decimal places for monetary values
  convertedAmount = Math.round(convertedAmount * 100) / 100;
  effectiveExchangeRate = Math.round(effectiveExchangeRate * 1000000) / 1000000;

  return {
    convertedAmount,
    exchangeRate: effectiveExchangeRate,
  };
}

/**
 * Validate if a conversion is supported
 * Returns true only for USD-based conversions
 */
export function isConversionSupported(fromCurrency: string, toCurrency: string): boolean {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // Same currency is always supported
  if (from === to) {
    return true;
  }

  // At least one currency must be USD
  return from === 'USD' || to === 'USD';
}
