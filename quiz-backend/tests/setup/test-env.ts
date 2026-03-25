import { beforeAll, afterAll, beforeEach } from 'vitest'

// Устанавливаем переменные окружения для тестов
process.env.DATABASE_URL = 'file:./dev.db'
process.env.JWT_SECRET = 'test-secret-key'
process.env.NODE_ENV = 'test'

beforeAll(() => {
    console.log('🔧 Test environment setup complete')
})

afterAll(() => {
    console.log('✅ Test environment cleaned up')
})