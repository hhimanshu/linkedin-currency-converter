/**
 * Represents a single exchange rate entry from the CSV
 */
export interface ExchangeRateEntry {
  recordDate: string;
  countryDescription: string;
  exchangeRate: number;
  effectiveDate: string;
  isoCode: string;
}

/**
 * Map structure for fast currency code lookup
 * Key: ISO currency code (e.g., "EUR")
 * Value: Exchange rate (1 USD = X foreign currency)
 */
export type ExchangeRateMap = Map<string, number>;

/**
 * Conversion request parameters
 */
export interface ConversionRequest {
  amount: number;
  from: string;
  to: string;
}

/**
 * Successful conversion response
 */
export interface ConversionResponse {
  success: true;
  data: {
    amount: number;
    from: string;
    to: string;
    convertedAmount: number;
    exchangeRate: number;
    timestamp: string;
  };
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
