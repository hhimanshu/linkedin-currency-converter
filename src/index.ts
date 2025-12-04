/**
 * Currency Converter API for Cloudflare Workers
 */

import { isCurrencySupported } from './services/exchangeRateService';
import { convertCurrency, isConversionSupported } from './services/conversionService';
import { validateConversionRequest } from './utils/validation';
import { ErrorResponses } from './utils/errorResponse';
import type { ConversionResponse } from './types/currency.types';

export interface Env {
  // Define bindings here (KV, R2, Durable Objects, etc.)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Only accept GET requests
    if (request.method !== 'GET') {
      return new Response(
        JSON.stringify({
          error: 'Method Not Allowed',
          message: 'Only GET requests are supported',
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Allow': 'GET',
          },
        }
      );
    }

    // Route: GET /
    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({
          message: 'Currency Converter API',
          version: '1.0.0',
          endpoints: {
            '/': 'API information',
            '/health': 'Health check',
            '/convert': 'Convert currency (params: amount, from, to)',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Route: GET /health
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Route: GET /convert
    if (url.pathname === '/convert') {
      try {
        // Step 1: Validate request parameters
        const validation = validateConversionRequest(url.searchParams);
        if (!validation.valid) {
          return ErrorResponses.invalidParameters(validation.errors);
        }

        const { amount, from, to } = validation.data;

        // Step 2: Check if both currencies are supported
        if (!isCurrencySupported(from)) {
          return ErrorResponses.unsupportedCurrency(from);
        }
        if (!isCurrencySupported(to)) {
          return ErrorResponses.unsupportedCurrency(to);
        }

        // Step 3: Check if conversion pattern is supported (USD-based only)
        if (!isConversionSupported(from, to)) {
          return ErrorResponses.unsupportedConversion(from, to);
        }

        // Step 4: Perform conversion
        const result = convertCurrency(amount, from, to);

        if (!result) {
          // This should not happen if validation is correct, but handle it
          return ErrorResponses.internalError();
        }

        // Step 5: Build success response
        const response: ConversionResponse = {
          success: true,
          data: {
            amount,
            from,
            to,
            convertedAmount: result.convertedAmount,
            exchangeRate: result.exchangeRate,
            timestamp: new Date().toISOString(),
          },
        };

        return new Response(JSON.stringify(response, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('Conversion error:', error);
        return ErrorResponses.internalError();
      }
    }

    // 404 for all other routes
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        path: url.pathname,
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
};
