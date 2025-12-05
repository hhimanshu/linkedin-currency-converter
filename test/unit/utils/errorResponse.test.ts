import { describe, it, expect } from 'vitest';
import { createErrorResponse, ErrorResponses } from '../../../src/utils/errorResponse';

describe('errorResponse (unit)', () => {
  describe('createErrorResponse', () => {
    it('should create error response with correct structure', async () => {
      const response = createErrorResponse('TEST_ERROR', 'Test message', 400);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
        },
      });
    });

    it('should include details when provided', async () => {
      const response = createErrorResponse('TEST_ERROR', 'Test message', 400, {
        field: 'value',
      });
      const body = await response.json();
      expect(body.error.details).toEqual({ field: 'value' });
    });

    it('should not include details when not provided', async () => {
      const response = createErrorResponse('TEST_ERROR', 'Test message', 400);
      const body = await response.json();
      expect(body.error.details).toBeUndefined();
    });

    it('should handle different status codes', async () => {
      const response400 = createErrorResponse('ERROR', 'Message', 400);
      expect(response400.status).toBe(400);

      const response500 = createErrorResponse('ERROR', 'Message', 500);
      expect(response500.status).toBe(500);

      const response404 = createErrorResponse('ERROR', 'Message', 404);
      expect(response404.status).toBe(404);
    });

    it('should format JSON with 2-space indentation', async () => {
      const response = createErrorResponse('TEST_ERROR', 'Test message', 400);
      const text = await response.text();
      expect(text).toContain('\n  ');
    });
  });

  describe('ErrorResponses.invalidParameters', () => {
    it('should return 400 with validation errors', async () => {
      const response = ErrorResponses.invalidParameters({
        amount: 'Invalid amount',
      });
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.message).toContain('invalid');
      expect(body.error.details.validationErrors).toEqual({
        amount: 'Invalid amount',
      });
    });

    it('should handle multiple validation errors', async () => {
      const response = ErrorResponses.invalidParameters({
        amount: 'Invalid amount',
        from: 'Invalid from currency',
        to: 'Invalid to currency',
      });

      const body = await response.json();
      expect(body.error.details.validationErrors).toEqual({
        amount: 'Invalid amount',
        from: 'Invalid from currency',
        to: 'Invalid to currency',
      });
    });

    it('should have correct Content-Type header', () => {
      const response = ErrorResponses.invalidParameters({ amount: 'Invalid' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('ErrorResponses.unsupportedCurrency', () => {
    it('should return 400 with currency info', async () => {
      const response = ErrorResponses.unsupportedCurrency('XXX');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNSUPPORTED_CURRENCY');
      expect(body.error.message).toContain('XXX');
      expect(body.error.message).toContain('not supported');
      expect(body.error.details.unsupportedCurrency).toBe('XXX');
    });

    it('should handle different currency codes', async () => {
      const response1 = ErrorResponses.unsupportedCurrency('FAKE');
      const body1 = await response1.json();
      expect(body1.error.message).toContain('FAKE');

      const response2 = ErrorResponses.unsupportedCurrency('YYY');
      const body2 = await response2.json();
      expect(body2.error.message).toContain('YYY');
    });
  });

  describe('ErrorResponses.unsupportedConversion', () => {
    it('should return 400 with conversion hint', async () => {
      const response = ErrorResponses.unsupportedConversion('EUR', 'JPY');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNSUPPORTED_CONVERSION');
      expect(body.error.message).toContain('USD-based');
      expect(body.error.details.from).toBe('EUR');
      expect(body.error.details.to).toBe('JPY');
      expect(body.error.details.hint).toContain('USD');
      expect(body.error.details.hint).toContain('Transitive');
    });

    it('should include helpful hint about transitive conversions', async () => {
      const response = ErrorResponses.unsupportedConversion('GBP', 'EUR');

      const body = await response.json();
      expect(body.error.details.hint).toContain('not supported');
      expect(body.error.details.hint).toContain('Transitive');
    });
  });

  describe('ErrorResponses.internalError', () => {
    it('should return 500', async () => {
      const response = ErrorResponses.internalError();
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(body.error.message).toContain('internal error');
    });

    it('should not include details', async () => {
      const response = ErrorResponses.internalError();
      const body = await response.json();
      expect(body.error.details).toBeUndefined();
    });

    it('should have correct Content-Type header', () => {
      const response = ErrorResponses.internalError();
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
