import { describe, it, expect } from 'vitest';
import { validateConversionRequest } from '../../../src/utils/validation';

describe('validation (unit)', () => {
  describe('validateConversionRequest', () => {
    it('should validate correct request', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({
          amount: 100,
          from: 'USD',
          to: 'EUR',
        });
      }
    });

    it('should validate request with decimal amount', () => {
      const params = new URLSearchParams({
        amount: '123.45',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.amount).toBe(123.45);
      }
    });

    it('should reject missing amount', () => {
      const params = new URLSearchParams({ from: 'USD', to: 'EUR' });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toBeDefined();
      }
    });

    it('should reject missing from currency', () => {
      const params = new URLSearchParams({ amount: '100', to: 'EUR' });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.from).toBeDefined();
        expect(result.errors.from).toContain('required');
      }
    });

    it('should reject missing to currency', () => {
      const params = new URLSearchParams({ amount: '100', from: 'USD' });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.to).toBeDefined();
        expect(result.errors.to).toContain('required');
      }
    });

    it('should reject invalid amount (not a number)', () => {
      const params = new URLSearchParams({
        amount: 'abc',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toContain('valid number');
      }
    });

    it('should reject zero amount', () => {
      const params = new URLSearchParams({
        amount: '0',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toContain('greater than 0');
      }
    });

    it('should reject negative amount', () => {
      const params = new URLSearchParams({
        amount: '-10',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toBeDefined();
      }
    });

    it('should reject Infinity', () => {
      const params = new URLSearchParams({
        amount: 'Infinity',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toContain('finite');
      }
    });

    it('should reject -Infinity', () => {
      const params = new URLSearchParams({
        amount: '-Infinity',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.amount).toBeDefined();
      }
    });

    it('should reject invalid currency code format (too short)', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'US',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.from).toContain('3-letter ISO code');
      }
    });

    it('should reject invalid currency code format (too long)', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'USDD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.from).toContain('3-letter ISO code');
      }
    });

    it('should reject invalid currency code format (numbers)', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'U1D',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.from).toBeDefined();
      }
    });

    it('should reject invalid currency code format (special characters)', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'US$',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.from).toBeDefined();
      }
    });

    it('should convert currency codes to uppercase', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'usd',
        to: 'eur',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.from).toBe('USD');
        expect(result.data.to).toBe('EUR');
      }
    });

    it('should handle mixed case currency codes', () => {
      const params = new URLSearchParams({
        amount: '100',
        from: 'UsD',
        to: 'eUr',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.from).toBe('USD');
        expect(result.data.to).toBe('EUR');
      }
    });

    it('should handle very large amounts', () => {
      const params = new URLSearchParams({
        amount: '999999999.99',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.amount).toBe(999999999.99);
      }
    });

    it('should handle very small amounts', () => {
      const params = new URLSearchParams({
        amount: '0.01',
        from: 'USD',
        to: 'EUR',
      });
      const result = validateConversionRequest(params);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.amount).toBe(0.01);
      }
    });
  });
});
