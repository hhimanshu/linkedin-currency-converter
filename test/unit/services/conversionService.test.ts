import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertCurrency, isConversionSupported } from '../../../src/services/conversionService';

// Mock the exchange rate service
vi.mock('../../../src/services/exchangeRateService', () => ({
  getExchangeRate: vi.fn((code: string) => {
    const rates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.85,
      JPY: 110.5,
      GBP: 0.73,
    };
    return rates[code.toUpperCase()];
  }),
}));

describe('conversionService (unit)', () => {
  describe('convertCurrency', () => {
    it('should return same amount for same currency (USD to USD)', () => {
      const result = convertCurrency(100, 'USD', 'USD');
      expect(result).toEqual({
        convertedAmount: 100,
        exchangeRate: 1.0,
      });
    });

    it('should return same amount for same currency (EUR to EUR)', () => {
      const result = convertCurrency(50, 'EUR', 'EUR');
      expect(result).toEqual({
        convertedAmount: 50,
        exchangeRate: 1.0,
      });
    });

    it('should convert USD to EUR correctly', () => {
      const result = convertCurrency(100, 'USD', 'EUR');
      expect(result).toEqual({
        convertedAmount: 85.0,
        exchangeRate: 0.85,
      });
    });

    it('should convert USD to JPY correctly', () => {
      const result = convertCurrency(100, 'USD', 'JPY');
      expect(result).toEqual({
        convertedAmount: 11050.0,
        exchangeRate: 110.5,
      });
    });

    it('should convert EUR to USD correctly', () => {
      const result = convertCurrency(100, 'EUR', 'USD');
      expect(result?.convertedAmount).toBeCloseTo(117.65, 2);
      expect(result?.exchangeRate).toBeCloseTo(1.176471, 6);
    });

    it('should convert GBP to USD correctly', () => {
      const result = convertCurrency(100, 'GBP', 'USD');
      expect(result?.convertedAmount).toBeCloseTo(136.99, 2);
      expect(result?.exchangeRate).toBeCloseTo(1.369863, 6);
    });

    it('should round amount to 2 decimal places', () => {
      const result = convertCurrency(100.123456, 'USD', 'EUR');
      expect(result?.convertedAmount).toBe(85.1);
      const amountString = result?.convertedAmount.toString() || '';
      const decimalPlaces = amountString.includes('.') ? amountString.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should round exchange rate to 6 decimal places', () => {
      const result = convertCurrency(100, 'EUR', 'USD');
      const rateString = result?.exchangeRate.toString() || '';
      const decimalPlaces = rateString.includes('.') ? rateString.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(6);
    });

    it('should return null for transitive conversion (EUR to JPY)', () => {
      const result = convertCurrency(100, 'EUR', 'JPY');
      expect(result).toBeNull();
    });

    it('should return null for transitive conversion (GBP to EUR)', () => {
      const result = convertCurrency(100, 'GBP', 'EUR');
      expect(result).toBeNull();
    });

    it('should return null for unsupported from currency', () => {
      const result = convertCurrency(100, 'XXX', 'USD');
      expect(result).toBeNull();
    });

    it('should return null for unsupported to currency', () => {
      const result = convertCurrency(100, 'USD', 'XXX');
      expect(result).toBeNull();
    });

    it('should be case insensitive', () => {
      const result1 = convertCurrency(100, 'usd', 'eur');
      const result2 = convertCurrency(100, 'USD', 'EUR');
      expect(result1).toEqual(result2);
    });

    it('should handle large amounts correctly', () => {
      const result = convertCurrency(1000000, 'USD', 'EUR');
      expect(result?.convertedAmount).toBe(850000.0);
    });

    it('should handle small amounts correctly', () => {
      const result = convertCurrency(0.01, 'USD', 'EUR');
      expect(result?.convertedAmount).toBeCloseTo(0.01, 2);
    });
  });

  describe('isConversionSupported', () => {
    it('should return true for same currency', () => {
      expect(isConversionSupported('EUR', 'EUR')).toBe(true);
      expect(isConversionSupported('USD', 'USD')).toBe(true);
      expect(isConversionSupported('JPY', 'JPY')).toBe(true);
    });

    it('should return true for USD to other currency', () => {
      expect(isConversionSupported('USD', 'EUR')).toBe(true);
      expect(isConversionSupported('USD', 'JPY')).toBe(true);
      expect(isConversionSupported('USD', 'GBP')).toBe(true);
    });

    it('should return true for other currency to USD', () => {
      expect(isConversionSupported('EUR', 'USD')).toBe(true);
      expect(isConversionSupported('JPY', 'USD')).toBe(true);
      expect(isConversionSupported('GBP', 'USD')).toBe(true);
    });

    it('should return false for non-USD transitive conversion', () => {
      expect(isConversionSupported('EUR', 'JPY')).toBe(false);
      expect(isConversionSupported('GBP', 'EUR')).toBe(false);
      expect(isConversionSupported('JPY', 'GBP')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isConversionSupported('usd', 'eur')).toBe(true);
      expect(isConversionSupported('USD', 'EUR')).toBe(true);
      expect(isConversionSupported('Usd', 'Eur')).toBe(true);
    });
  });
});
