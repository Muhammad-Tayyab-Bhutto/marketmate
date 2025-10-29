export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/pwa/src/$1'
  },
  collectCoverageFrom: [
    'pwa/src/**/*.{ts,tsx}',
    '!pwa/src/**/*.d.ts',
    '!pwa/src/main.tsx',
    '!pwa/src/App.tsx'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};

