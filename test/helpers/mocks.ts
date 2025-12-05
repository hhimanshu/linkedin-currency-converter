import { vi } from 'vitest';

export function mockExchangeRateService(rates: Record<string, number>) {
  vi.mock('../../src/services/exchangeRateService', () => ({
    getExchangeRate: vi.fn((code: string) => rates[code.toUpperCase()]),
    isCurrencySupported: vi.fn((code: string) => code.toUpperCase() in rates),
    getSupportedCurrencies: vi.fn(() => Object.keys(rates)),
    getExchangeRateCount: vi.fn(() => Object.keys(rates).length),
  }));
}

export function createTestRequest(
  path: string,
  params?: Record<string, string>
): Request {
  const url = new URL(path, 'http://example.com');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new Request(url.toString());
}
