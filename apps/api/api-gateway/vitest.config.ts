import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        '*.config.*', // ignore les fichiers config
        'test/**/*.e2e-spec.ts', // ignore les fichiers de test-e2e
        'src/main.ts', // ignore le bootstrap
        'src/types/**/*', // ignore les types
        'src/**/*.controller.ts', // ignore les controller
        '**/*.interface.ts', // ignore les controller
        'src/**/*.spec.ts', // ignore les fichiers de test
        'src/**/*.module.ts', // ignore les fichiers module
        'src/**/*.listener.*', // ignore tous les listener
        'src/**/dto/*.ts', // ignore tous les DTOs
        'src/**/mocks/**', // ignore tous les mocks
        'dist/**/*', // ignore tous les mocks
        'src/app.service.ts', // ignore tous les mocks
      ],
    },
  },
});
