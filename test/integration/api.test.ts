import { describe, it, expect } from 'vitest';
import worker from '../../src/index';

const env = {} as any;
const ctx = {
  waitUntil: () => {},
  passThroughOnException: () => {},
} as any;

async function makeRequest(url: string, options?: RequestInit): Promise<Response> {
  const request = new Request(url, options);
  return worker.fetch(request, env, ctx);
}

describe('Currency Converter API (integration)', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const response = await makeRequest('http://example.com/');
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body.message).toBe('Currency Converter API');
      expect(body.version).toBe('1.0.0');
      expect(body.timestamp).toBeDefined();
    });

    it('should include CORS headers', async () => {
      const response = await makeRequest('http://example.com/');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await makeRequest('http://example.com/health');
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeDefined();
    });

  });

  describe('GET /convert - Success cases', () => {
    it('should convert USD to EUR', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(100);
      expect(body.data.from).toBe('USD');
      expect(body.data.to).toBe('EUR');
      expect(body.data.convertedAmount).toBeGreaterThan(0);
      expect(body.data.exchangeRate).toBeGreaterThan(0);
      expect(body.data.timestamp).toBeDefined();
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should convert EUR to USD', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=EUR&to=USD'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.convertedAmount).toBeGreaterThan(0);
      expect(body.data.exchangeRate).toBeGreaterThan(0);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should convert USD to JPY', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=JPY'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.to).toBe('JPY');
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should convert GBP to USD', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=50&from=GBP&to=USD'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(50);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should handle same currency conversion', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=USD'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.convertedAmount).toBe(100);
      expect(body.data.exchangeRate).toBe(1.0);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should handle same currency conversion (EUR to EUR)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=75&from=EUR&to=EUR'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.convertedAmount).toBe(75);
      expect(body.data.exchangeRate).toBe(1.0);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should handle decimal amounts', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=123.45&from=USD&to=EUR'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(123.45);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should handle large amounts', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=1000000&from=USD&to=EUR'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(1000000);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should handle small amounts', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=0.01&from=USD&to=EUR'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(0.01);
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should be case insensitive for currency codes', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=usd&to=eur'
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.from).toBe('USD');
      expect(body.data.to).toBe('EUR');
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
      expect(typeof body.data.totalCurrencies).toBe('number');
    });

    it('should include CORS headers', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should include totalCurrencies field in all successful responses', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      const body = await response.json();

      expect(body.data.totalCurrencies).toBeDefined();
      expect(typeof body.data.totalCurrencies).toBe('number');
      expect(body.data.totalCurrencies).toBeGreaterThan(140);
    });

    it('should return consistent totalCurrencies across different conversions', async () => {
      const response1 = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      const response2 = await makeRequest(
        'http://example.com/convert?amount=50&from=GBP&to=USD'
      );

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.data.totalCurrencies).toBe(body2.data.totalCurrencies);
      expect(body1.data.totalCurrencies).toBeGreaterThan(140);
    });
  });

  describe('GET /convert - Validation errors', () => {
    it('should reject missing amount', async () => {
      const response = await makeRequest('http://example.com/convert?from=USD&to=EUR');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.amount).toBeDefined();
    });

    it('should reject missing from currency', async () => {
      const response = await makeRequest('http://example.com/convert?amount=100&to=EUR');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.from).toBeDefined();
    });

    it('should reject missing to currency', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.to).toBeDefined();
    });

    it('should reject all missing parameters', async () => {
      const response = await makeRequest('http://example.com/convert');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.details.validationErrors.amount).toBeDefined();
      expect(body.error.details.validationErrors.from).toBeDefined();
      expect(body.error.details.validationErrors.to).toBeDefined();
    });

    it('should reject invalid amount (not a number)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=abc&from=USD&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.amount).toContain('valid number');
    });

    it('should reject negative amount', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=-10&from=USD&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
    });

    it('should reject zero amount', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=0&from=USD&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.amount).toContain('greater than 0');
    });

    it('should reject Infinity', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=Infinity&from=USD&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.amount).toContain('finite');
    });

    it('should reject invalid currency code format (too short)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=US&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
      expect(body.error.details.validationErrors.from).toContain('3-letter ISO code');
    });

    it('should reject invalid currency code format (too long)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USDD&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
    });

    it('should reject invalid currency code format (numbers)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=U1D&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('INVALID_PARAMETERS');
    });
  });

  describe('GET /convert - Currency support errors', () => {
    it('should reject unsupported from currency', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=XXX&to=USD'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('UNSUPPORTED_CURRENCY');
      expect(body.error.message).toContain('XXX');
      expect(body.error.details.unsupportedCurrency).toBe('XXX');
    });

    it('should reject unsupported to currency', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=YYY'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('UNSUPPORTED_CURRENCY');
      expect(body.error.message).toContain('YYY');
    });

    it('should reject transitive conversion (EUR to JPY)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=EUR&to=JPY'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('UNSUPPORTED_CONVERSION');
      expect(body.error.details.from).toBe('EUR');
      expect(body.error.details.to).toBe('JPY');
      expect(body.error.details.hint).toContain('USD');
    });

    it('should reject transitive conversion (GBP to EUR)', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=GBP&to=EUR'
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('UNSUPPORTED_CONVERSION');
    });

    it('should NOT include totalCurrencies in error responses', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=XXX&to=USD'
      );
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.data).toBeUndefined();
      expect(body.totalCurrencies).toBeUndefined();
    });
  });

  describe('HTTP Methods', () => {
    it('should reject POST requests to /convert', async () => {
      const response = await makeRequest('http://example.com/convert', {
        method: 'POST',
      });
      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET');

      const body = await response.json();
      expect(body.error).toBe('Method Not Allowed');
    });

    it('should reject PUT requests', async () => {
      const response = await makeRequest('http://example.com/', {
        method: 'PUT',
      });
      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET');
    });

    it('should reject DELETE requests', async () => {
      const response = await makeRequest('http://example.com/health', {
        method: 'DELETE',
      });
      expect(response.status).toBe(405);
    });

    it('should reject PATCH requests', async () => {
      const response = await makeRequest('http://example.com/convert', {
        method: 'PATCH',
      });
      expect(response.status).toBe(405);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown paths', async () => {
      const response = await makeRequest('http://example.com/unknown');
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Not Found');
      expect(body.path).toBe('/unknown');
    });

    it('should return 404 for /api path', async () => {
      const response = await makeRequest('http://example.com/api');
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.path).toBe('/api');
    });

    it('should return 404 for nested unknown paths', async () => {
      const response = await makeRequest('http://example.com/unknown/nested/path');
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.path).toBe('/unknown/nested/path');
    });
  });

  describe('Response formatting', () => {
    it('should return properly formatted JSON with 2-space indent', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      const text = await response.text();
      expect(text).toContain('\n  ');
    });

    it('should return Content-Type application/json', async () => {
      const response = await makeRequest(
        'http://example.com/convert?amount=100&from=USD&to=EUR'
      );
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
