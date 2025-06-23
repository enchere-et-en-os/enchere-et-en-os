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
        'src/job-runner.service.ts', // ignore le fichier, car appel de fonction uniquement
        'src/types/**/*', // ignore les types
        'src/**/*.spec.ts', // ignore les fichiers de test
        'src/**/*.module.ts', // ignore les fichiers module
        'src/**/dto/*.ts', // ignore tous les DTOs
        'src/**/mocks/**', // ignore tous les mocks
      ],
    },
  },
});
