import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { mockDataService } from '../services/mockDataService.js'
import { config } from '../config/config.js'
import { verify } from 'hono/jwt';
import { handleError, throwError } from '../utils/errors.js';

const prisma = new PrismaClient();
const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

// GET /api/questions - получить все вопросы (без правильных ответов)
app.get('/', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401); // ← ВАЖНО: сразу возвращаем 401
        }

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return c.json({ error: 'Invalid token' }, 401); // ← ВАЖНО: 401 при неверном токене
        }

        // Получаем параметры фильтрации
        const { category, type } = c.req.query();

        if (config.USE_MOCK_DATA) {
            console.log('📦 Using MOCK data for questions');

            // Получаем все вопросы из моков
            let questions = await mockDataService.getQuestions();

            // Применяем фильтры вручную для мок-данных
            if (category) {
                questions = questions.filter(q => q.categoryId === category);
            }
            if (type) {
                questions = questions.filter(q => q.type === type);
            }

            return c.json({ questions });
        }

        // РЕАЛЬНАЯ БД
        const where: any = {};
        if (category) where.categoryId = category;
        if (type) where.type = type;

        const questions = await prisma.question.findMany({
            where,
            select: {
                id: true,
                text: true,
                type: true,
                points: true,
                categoryId: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({ questions });

    } catch (error) {
        console.error('Error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/questions/categories - получить все категории
app.get('/categories', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) throwError("Unauthorized 401");

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return throwError ('Invalid token, 401');
        }

        if (config.USE_MOCK_DATA) {
            console.log('📦 Using MOCK data for categories');
            const categories = await mockDataService.getCategories();
            return c.json({ categories });
        }

        // РЕАЛЬНАЯ БД
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return c.json({ categories });

    } catch (error) {
        return throwError("Failed to fetch categories, 500");}

});

// GET /api/questions/:id - получить конкретный вопрос
app.get('/:id', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) throwError("Unauthorized, 401");

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return throwError("Invalid token, 401");
        }

        const { id } = c.req.param();

        if (config.USE_MOCK_DATA) {
            console.log('📦 Using MOCK data for single question');
            const question = await mockDataService.getQuestionById(id);

            if (!question) throwError("Question not found, 404");

            return c.json({ question });
        }

        // РЕАЛЬНАЯ БД
        const question = await prisma.question.findUnique({
            where: { id },
            select: {
                id: true,
                text: true,
                type: true,
                points: true,
                categoryId: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }

        return c.json({ question });

    } catch (error) {
        console.error('Error fetching question:', error);
        return c.json({ error: 'Failed to fetch question' }, 500);
    }
});

export default app;
