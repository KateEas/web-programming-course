import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { AuthCodeSchema } from '../utils/validation.js'
import type { GitHubUser, GitHubEmail, JWTPayload } from '../utils/validation.js'
import { PrismaClient } from '@prisma/client'

const auth = new Hono()
const prisma = new PrismaClient()
console.log('Prisma client created, DATABASE_URL:', process.env.DATABASE_URL)


const MOCK_USERS: Record<string, { id: number; login: string; name: string; email: string; role: string }> = {
    'test_code': {
        id: 12345678,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' 
    },
    'test_student': {
        id: 87654321,
        login: 'student',
        name: 'Иван Петров',
        email: 'ivan@student.ru',
        role: 'student'
    },
    'test_teacher': {
        id: 55555555,
        login: 'teacher',
        name: 'Мария Ивановна',
        email: 'teacher@school.ru',
        role: 'admin'
    }
}

auth.post('/github/callback', async (c) => {
    try {
        
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

        // 2. MOCK режим для тестирования
        if (code.startsWith('test_')) {
            console.log('Using mock mode with code:', code)

            const mockUser = MOCK_USERS[code] || MOCK_USERS['test_code']
            console.log('Mock user data:', mockUser)

            const user = await prisma.user.upsert({
                where: { githubId: mockUser.id.toString() },
                update: {
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role
                },
                create: {
                    githubId: mockUser.id.toString(),
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role
                }
            })

            console.log('User saved to DB:', user)
            
            // JWT токен
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 
            }

            const token = await sign(payload, JWT_SECRET, 'HS256')

            return c.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    githubId: user.githubId,
                    createdAt: user.createdAt
                }
            })
        }


    } catch (error) {
        console.error('Auth error:', error)
        return c.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})


auth.get('/test', (c) => {
    return c.json({
        message: 'Auth routes are working!',
        endpoints: {
            'POST /github/callback': 'Send {"code": "test_student"} for mock auth'
        },
        note: 'Only mock codes (test_*) are accepted'
    })
})

auth.get('/me', async (c) => {
    try {

        const authHeader = c.req.header('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized - No token provided' }, 401)
        }

       
        const token = authHeader.split(' ')[1]
        const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production'

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined')
            return c.json({ error: 'Server configuration error' }, 500)
        }

  
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
