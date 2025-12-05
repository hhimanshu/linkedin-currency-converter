import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'csv-loader',
      transform(src, id) {
        if (id.endsWith('.csv')) {
          return {
            code: `export default ${JSON.stringify(src)}`,
            map: null,
          };
        }
      },
    },
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'src/types/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
