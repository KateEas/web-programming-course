import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../app.js'

describe('Auth Feature', () => {
    beforeAll(() => {
        process.env.DATABASE_URL = 'file:./test.db'
        process.env.JWT_SECRET = 'test-secret-key'
    })

    it('тест работает', () => {
        expect(true).toBe(true)
    })

  it('POST /api/auth/github/callback - успешная авторизация', async () => {
    const res = await app.request('/api/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code: 'test_student' })
    })
    expect(res.status).toBe(200)
  })
  

})
