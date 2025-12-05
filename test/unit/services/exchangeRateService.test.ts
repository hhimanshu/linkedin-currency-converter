import { describe, it, expect } from 'vitest';
import {
  getExchangeRate,
  isCurrencySupported,
  getSupportedCurrencies,
  getExchangeRateCount,
} from '../../../src/services/exchangeRateService';

describe('exchangeRateService (unit)', () => {
  describe('getExchangeRate', () => {
    it('should return 1.0 for USD', () => {
      expect(getExchangeRate('USD')).toBe(1.0);
    });

    it('should return rate for valid currency (EUR)', () => {
      const rate = getExchangeRate('EUR');
      expect(rate).toBeTypeOf('number');
      expect(rate).toBeGreaterThan(0);
    });

    it('should return rate for valid currency (JPY)', () => {
      const rate = getExchangeRate('JPY');
      expect(rate).toBeTypeOf('number');
      expect(rate).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const upperRate = getExchangeRate('EUR');
      const lowerRate = getExchangeRate('eur');
      const mixedRate = getExchangeRate('Eur');
      expect(upperRate).toBe(lowerRate);
      expect(upperRate).toBe(mixedRate);
    });

    it('should return undefined for unsupported currency', () => {
      expect(getExchangeRate('XXX')).toBeUndefined();
      expect(getExchangeRate('FAKE')).toBeUndefined();
    });
  });

  describe('isCurrencySupported', () => {
    it('should return true for USD', () => {
      expect(isCurrencySupported('USD')).toBe(true);
    });

    it('should return true for known currencies', () => {
      expect(isCurrencySupported('EUR')).toBe(true);
      expect(isCurrencySupported('JPY')).toBe(true);
      expect(isCurrencySupported('GBP')).toBe(true);
    });

    it('should return false for unknown currency', () => {
      expect(isCurrencySupported('FAKE')).toBe(false);
      expect(isCurrencySupported('XXX')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isCurrencySupported('usd')).toBe(true);
      expect(isCurrencySupported('USD')).toBe(true);
      expect(isCurrencySupported('Usd')).toBe(true);
      expect(isCurrencySupported('eur')).toBe(true);
      expect(isCurrencySupported('EUR')).toBe(true);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return an array of currency codes', () => {
      const currencies = getSupportedCurrencies();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);
    });

    it('should include USD in supported currencies', () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toContain('USD');
    });

    it('should include common currencies', () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toContain('EUR');
      expect(currencies).toContain('JPY');
      expect(currencies).toContain('GBP');
    });
  });

  describe('getExchangeRateCount', () => {
    it('should return count greater than 140', () => {
      const count = getExchangeRateCount();
      expect(count).toBeGreaterThan(140);
    });

    it('should return a positive number', () => {
      const count = getExchangeRateCount();
      expect(count).toBeTypeOf('number');
      expect(count).toBeGreaterThan(0);
    });
  });
});
