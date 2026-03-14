import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verify } from 'hono/jwt';
import { sessionService } from '../services/sessionService.js';
import { handleError, throwError, throwUnauthorized, throwNotFound, throwForbidden } from '../utils/errors.js';

const prisma = new PrismaClient();
const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

// Схемы валидации
const CreateSessionSchema = z.object({
    durationHours: z.number().min(0.5).max(24).optional().default(1)
});

const AnswerSchema = z.object({
    questionId: z.string().uuid(),
    userAnswer: z.union([
        z.string(),
        z.array(z.string())
    ])
});

// Вспомогательная функция для проверки токена и получения userId
async function getUserIdFromToken(c: any): Promise<string | null> {
    const authHeader = c.req.header('Authorization');
    console.log('🔍 Auth header:', authHeader) 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No valid auth header')
        return null;
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Token:', token.substring(0, 20) + '...')
    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');
        console.log('✅ Token verified, userId:', payload.userId)
        return payload.userId as string;
    } catch {
        console.log('❌ Token verification failed:')
        return null;
    }
}

// POST /api/sessions - создать новую сессию
app.post('/', async (c) => {
    try {
        // 1. Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwUnauthorized(); // ← ТЕПЕРЬ 401!

        // 2. Проверяем пользователя
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) throwNotFound("User not found");

        // 3. Валидация
        const body = await c.req.json().catch(() => ({}));
        const validated = CreateSessionSchema.parse(body);

        // 4. Создаем сессию
        const session = await sessionService.createSession(userId, validated.durationHours);
        const questionsCount = await prisma.question.count();

        return c.json({
            session: {
                id: session.id,
                status: session.status,
                expiresAt: session.expiresAt,
                startedAt: session.startedAt,
                totalQuestions: questionsCount
            }
        }, 201);

    } catch (error) {
        return handleError(c, error);
    }
});

// POST /api/sessions/:id/answers - добавить ответ
app.post('/:id/answers', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwUnauthorized;

        const { id } = c.req.param();
        const body = await c.req.json();

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true, expiresAt: true }
        });

        if (!session) throwNotFound('Сессия не найдена');

        const validatedData = AnswerSchema.parse(body);

        if (session.userId !== userId) throwForbidden();

        if (session.status !== 'in_progress') throwError('Сессия не активна');

        if (session.expiresAt < new Date()) throwError("Сессия истекла");

        // Добавляем ответ
        const answer = await sessionService.submitAnswer(
            id,
            validatedData.questionId,
            validatedData.userAnswer
        );

        // Парсим ответ для отправки
        const userAnswer = typeof answer.userAnswer === 'string'
            ? JSON.parse(answer.userAnswer)
            : answer.userAnswer;

        return c.json({
            answer: {
                id: answer.id,
                questionId: answer.questionId,
                userAnswer,
                score: answer.score,
                isCorrect: answer.isCorrect,
                createdAt: answer.createdAt
            }
        }, 201);

    } catch (error) {
        return handleError(c, error); // Одна строка для всех ошибок!
    }
});

// GET /api/sessions/:id - получить сессию с ответами
app.get('/:id', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwError("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throwNotFound("User not found");
        const body = await c.req.json().catch(() => ({}));
        const validated = CreateSessionSchema.parse(body);
        const durationHours = validated.durationHours;

        const session = await sessionService.createSession(userId, durationHours);
      
        const questionsCount = await prisma.question.count();

        return c.json({
            session: {
                id: session.id,
                status: session.status,
                expiresAt: session.expiresAt,
                startedAt: session.startedAt,
                totalQuestions: questionsCount
            }
        }, 201);

    } catch (error) {
        return handleError(c, error);
    }
});

// POST /api/sessions/:id/submit - завершить сессию
app.post('/:id/submit', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwError("Unauthorized");
        const { id } = c.req.param();

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true }
        });

        if (!session) throwError("Session not found");

        if (session.userId !== userId)throwError("Access denied");

        if (session.status !== 'in_progress') throwError("Session is already completed");
        
        // Завершаем сессию
        const completedSession = await sessionService.submitSession(id);

        return c.json({
            session: {
                id: completedSession.id,
                status: completedSession.status,
                score: completedSession.score,
                completedAt: completedSession.completedAt
            }
        });

    } catch (error) {
        return handleError(c, error)
    }
});

export default app;
