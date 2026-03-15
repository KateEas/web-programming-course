import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup/test-env.ts'],
        env: {
            DATABASE_URL: 'file:./dev.db',
            JWT_SECRET: 'test-secret-key'
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
        }
    }
})