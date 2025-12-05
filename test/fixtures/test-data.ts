export const mockExchangeRates = {
  USD: 1.0,
  EUR: 0.85,
  JPY: 110.5,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35,
};

export const testConversions = [
  { amount: 100, from: 'USD', to: 'EUR', expected: 85.0 },
  { amount: 100, from: 'EUR', to: 'USD', expected: 117.65 },
  { amount: 1000, from: 'USD', to: 'JPY', expected: 110500.0 },
  { amount: 100, from: 'USD', to: 'USD', expected: 100.0 },
];

export const invalidRequests = [
  { params: { from: 'USD', to: 'EUR' }, error: 'amount' },
  { params: { amount: '100', to: 'EUR' }, error: 'from' },
  { params: { amount: '100', from: 'USD' }, error: 'to' },
  { params: { amount: '-10', from: 'USD', to: 'EUR' }, error: 'amount' },
  { params: { amount: 'abc', from: 'USD', to: 'EUR' }, error: 'amount' },
];
