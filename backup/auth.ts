import { Hono } from 'hono'
import { sign, verify} from 'hono/jwt'
import { AuthCodeSchema } from '../utils/validation'
import type { GitHubUser, GitHubEmail, JWTPayload } from '../utils/validation'
import { PrismaClient } from '@prisma/client'

const auth = new Hono()
const prisma = new PrismaClient()

// Mock данные для тестирования
const MOCK_USERS: Record<string, { id: number; login: string; name: string; email: string }> = {
    'test_code': {
        id: 12345678,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com'
    },
    'test_student': {
        id: 87654321,
        login: 'student',
        name: 'Иван Петров',
        email: 'ivan@student.ru'
    },
    'test_teacher': {
        id: 55555555,
        login: 'teacher',
        name: 'Мария Ивановна',
        email: 'teacher@school.ru'
    }
}

// Вспомогательная функция для получения email из GitHub
async function getGitHubEmail(accessToken: string): Promise<string> {
    try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/json',
                'User-Agent': 'Quiz-Backend-App'
            }
        })

        if (!emailsResponse.ok) {
            throw new Error(`Failed to fetch GitHub emails: ${emailsResponse.status}`)
        }

        const emails: GitHubEmail[] = await emailsResponse.json()
        const primaryEmail = emails.find(e => e.primary && e.verified)

        if (!primaryEmail) {
            throw new Error('No verified primary email found')
        }

        return primaryEmail.email
    } catch (error) {
        console.error('Error fetching GitHub email:', error)
        throw error
    }
}

// POST /api/auth/github/callback
auth.post('/github/callback', async (c) => {
    try {
        // 1. Валидация входных данных
        const body = await c.req.json()
        console.log('Received auth request with body:', body)

        const validation = AuthCodeSchema.safeParse(body)

        if (!validation.success) {
            console.error('Validation error:', validation.error.issues)
            return c.json({
                error: 'Invalid request',
                details: validation.error.issues
            }, 400)
        }

        const { code } = validation.data
        const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production'

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined')
            return c.json({ error: 'Server configuration error' }, 500)
        }

        // 2. MOCK режим для тестирования (БЕЗ БАЗЫ ДАННЫХ)
        if (code.startsWith('test_')) {
            console.log('Using mock mode with code:', code)

            const mockUser = MOCK_USERS[code] || MOCK_USERS['test_code']
            console.log('Mock user data:', mockUser)

            // Создаем тестового пользователя без БД
            const user = {
                id: "mock-" + Date.now(),
                email: mockUser.email,
                name: mockUser.name,
                githubId: mockUser.id.toString(),
                createdAt: new Date().toISOString()
            }

            console.log('Mock user created:', user)

            // Создаем JWT токен
            const payload = {
                userId: user.id,
                email: user.email,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 дней
            }

            const token = await sign(payload, JWT_SECRET, 'HS256')

            return c.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    githubId: user.githubId,
                    createdAt: user.createdAt
                }
            })
        }

        // 3. REAL режим - работа с GitHub API
        console.log('Using real GitHub OAuth mode')

        // Здесь будет код для реального GitHub OAuth
        // Пока возвращаем сообщение, что режим не реализован
        return c.json({
            error: 'Real GitHub OAuth mode not implemented in mock version',
            message: 'This is a mock server. Use test_code, test_student, or test_teacher for testing.'
        }, 501)

    } catch (error) {
        console.error('Auth error:', error)
        return c.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

// Добавим тестовый endpoint для проверки
auth.get('/test', (c) => {
    return c.json({
        message: 'Auth routes are working!',
        endpoints: {
            'POST /github/callback': 'Send {"code": "test_student"} for mock auth'
        }
    })
})

auth.get('/me', async (c) => {
    try {
        // 1. Получаем заголовок Authorization
        const authHeader = c.req.header('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized - No token provided' }, 401)
        }

        // 2. Извлекаем токен
        const token = authHeader.split(' ')[1]
        const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production'

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined')
            return c.json({ error: 'Server configuration error' }, 500)
        }

        // 3. Проверяем валидность токена
        let payload
        try {
            payload = await verify(token, JWT_SECRET, 'HS256')
            console.log('Token verified, payload:', payload)
        } catch (error) {
            console.error('JWT verification error:', error)
            return c.json({ error: 'Unauthorized - Invalid token' }, 401)
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string }
        })

        if (!user) {
            return c.json({ error: 'User not found' }, 404)
        }
        return c.json({
            user: {
                // id: payload.userId,
                // email: payload.email,
                // name: 'User from token', 
                // githubId: 'mock-github-id',
                // createdAt: new Date().toISOString()
                id: user.id,
                email: user.email,
                name: user.name,
                githubId: user.githubId,
                createdAt: user.createdAt
            }
        })

    } catch (error) {
        console.error('Get user error:', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})
export { auth }


