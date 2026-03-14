import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/admin.js'; 
import { scoringService } from '../services/scoringService.js';

const prisma = new PrismaClient();
const app = new Hono();


const QuestionSchema = z.object({
    text: z.string().min(3).max(500),
    type: z.enum(['multiple-select', 'essay']),
    categoryId: z.string().uuid(),
    correctAnswer: z.any().optional(),
    points: z.number().min(1).max(100).default(1)
});

const GradeSchema = z.object({
    scores: z.array(z.number().min(0).max(100)),
    feedback: z.string().optional()
});

const CategorySchema = z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/)
});

app.use('*', requireAdmin);


// GET /api/admin/questions - все вопросы (с правильными ответами)
app.get('/questions', async (c) => {
    try {
        const questions = await prisma.question.findMany({
            include: {
                category: {
                    select: { name: true, slug: true }
                },
                _count: {
                    select: { answers: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return c.json({
            success: true,
            questions
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return c.json({ error: 'Ошибка при получении вопросов' }, 500);
    }
});

// POST /api/admin/questions - создать вопрос
app.post('/questions', async (c) => {
    try {
        const body = await c.req.json();
        const validation = QuestionSchema.safeParse(body);

        if (!validation.success) {
            return c.json({
                error: 'Ошибка валидации',
                details: validation.error.format()
            }, 400);
        }

        const data = validation.data;

        const question = await prisma.question.create({
            data: {
                text: data.text,
                type: data.type,
                categoryId: data.categoryId,
                correctAnswer: data.correctAnswer || null,
                points: data.points
            },
            include: {
                category: true
            }
        });

        return c.json({
            success: true,
            message: 'Вопрос успешно создан',
            question
        }, 201);
    } catch (error) {
        console.error('Error creating question:', error);
        return c.json({ error: 'Ошибка при создании вопроса' }, 500);
    }
});

// PUT /api/admin/questions/:id - обновить вопрос
app.put('/questions/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const validation = QuestionSchema.partial().safeParse(body);

        if (!validation.success) {
            return c.json({
                error: 'Ошибка валидации',
                details: validation.error.format()
            }, 400);
        }

        const question = await prisma.question.update({
            where: { id },
            data: validation.data,
            include: { category: true }
        });

        return c.json({
            success: true,
            message: 'Вопрос успешно обновлен',
            question
        });
    } catch (error) {
        console.error('Error updating question:', error);
        return c.json({ error: 'Ошибка при обновлении вопроса' }, 500);
    }
});

// DELETE /api/admin/questions/:id - удалить вопрос
app.delete('/questions/:id', async (c) => {
    try {
        const { id } = c.req.param();

        await prisma.question.delete({
            where: { id }
        });

        return c.json({
            success: true,
            message: 'Вопрос успешно удален'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        return c.json({ error: 'Ошибка при удалении вопроса' }, 500);
    }
});

// GET /api/admin/categories - все категории
app.get('/categories', async (c) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return c.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Ошибка при получении категорий' }, 500);
    }
});

// POST /api/admin/categories - создать категорию
app.post('/categories', async (c) => {
    try {
        const body = await c.req.json();
        const validation = CategorySchema.safeParse(body);

        if (!validation.success) {
            return c.json({
                error: 'Ошибка валидации',
                details: validation.error.format()
            }, 400);
        }

        const category = await prisma.category.create({
            data: validation.data
        });

        return c.json({
            success: true,
            message: 'Категория успешно создана',
            category
        }, 201);
    } catch (error) {
        console.error('Error creating category:', error);
        return c.json({ error: 'Ошибка при создании категории' }, 500);
    }
});


// GET /api/admin/answers/pending - непроверенные эссе
app.get('/answers/pending', async (c) => {
    try {
        const { page = '1', limit = '20' } = c.req.query();
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const answers = await prisma.answer.findMany({
            where: {
                score: null,
                question: {
                    type: 'essay'
                }
            },
            include: {
                question: {
                    select: {
                        id: true,
                        text: true,
                        points: true,
                        correctAnswer: true
                    }
                },
                session: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'asc' }
        });

        const total = await prisma.answer.count({
            where: {
                score: null,
                question: { type: 'essay' }
            }
        });

        return c.json({
            success: true,
            answers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pending answers:', error);
        return c.json({ error: 'Ошибка при получении непроверенных ответов' }, 500);
    }
});

// POST /api/admin/answers/:id/grade - оценить эссе
app.post('/answers/:id/grade', async (c) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const validation = GradeSchema.safeParse(body);

        if (!validation.success) {
            return c.json({
                error: 'Ошибка валидации',
                details: validation.error.format()
            }, 400);
        }

        const { scores, feedback } = validation.data;


        const result = await prisma.$transaction(async (tx) => {
            const answer = await tx.answer.findUnique({
                where: { id },
                include: {
                    question: true,
                    session: {
                        include: { answers: true }
                    }
                }
            });

            if (!answer) {
                throw new Error('Ответ не найден');
            }

            if (answer.question.type !== 'essay') {
                throw new Error('Можно оценивать только эссе');
            }


            const rubric = answer.question.correctAnswer as Record<string, number> || {};
            const totalScore = scoringService.scoreEssay(scores, rubric);

            const updatedAnswer = await tx.answer.update({
                where: { id },
                data: {
                    score: totalScore,
                    isCorrect: totalScore > 0
                }
            });


            const sessionAnswers = await tx.answer.findMany({
                where: { sessionId: answer.sessionId }
            });

            const allGraded = sessionAnswers.every(a => a.score !== null);

            if (allGraded) {
                const totalSessionScore = sessionAnswers.reduce(
                    (sum, a) => sum + (a.score || 0),
                    0
                );

                await tx.session.update({
                    where: { id: answer.sessionId },
                    data: {
                        score: totalSessionScore,
                        status: 'completed'
                    }
                });
            }

            return updatedAnswer;
        });

        return c.json({
            success: true,
            message: 'Эссе успешно оценено',
            answer: result
        });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        console.error('Error grading answer:', error);
        return c.json({ error: 'Ошибка при оценке эссе' }, 500);
    }
});


// GET /api/admin/stats - общая статистика
app.get('/stats', async (c) => {
    try {
        const [
            totalUsers,
            totalSessions,
            totalQuestions,
            completedSessions,
            pendingGrading
        ] = await Promise.all([
            prisma.user.count(),
            prisma.session.count(),
            prisma.question.count(),
            prisma.session.count({ where: { status: 'completed' } }),
            prisma.answer.count({
                where: {
                    score: null,
                    question: { type: 'essay' }
                }
            })
        ]);

        const avgScore = await prisma.session.aggregate({
            where: { status: 'completed' },
            _avg: { score: true }
        });

        const averageScore = avgScore._avg.score ? Math.round(avgScore._avg.score * 100) / 100 : 0;

        return c.json({
            success: true,
            stats: {
                totalUsers,
                totalSessions,
                totalQuestions,
                completedSessions,
                pendingGrading,
                averageScore,
                completionRate: totalSessions ?
                    Math.round((completedSessions / totalSessions) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return c.json({ error: 'Ошибка при получении статистики' }, 500);
    }
});

// GET /api/admin/leaderboard - топ студентов
app.get('/leaderboard', async (c) => {
    try {
        const { limit = '10' } = c.req.query();

        const leaderboard = await prisma.session.groupBy({
            by: ['userId'],
            where: { status: 'completed' },
            _avg: { score: true },
            _max: { score: true },
            _count: { id: true },
            orderBy: {
                _avg: { score: 'desc' }
            },
            take: parseInt(limit)
        });


        const withNames = await Promise.all(
            leaderboard.map(async (entry) => {
                const user = await prisma.user.findUnique({
                    where: { id: entry.userId },
                    select: { name: true, email: true }
                });

                const averageScore = entry._avg.score ? Math.round(entry._avg.score * 100) / 100 : 0;

                return {
                    userId: entry.userId,
                    userName: user?.name || 'Неизвестный',
                    email: user?.email,
                    averageScore,
                    bestScore: entry._max.score || 0,
                    sessionsCount: entry._count.id
                };
            })
        );

        return c.json({
            success: true,
            leaderboard: withNames
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return c.json({ error: 'Ошибка при получении таблицы лидеров' }, 500);
    }
});

// GET /api/admin/students/:userId/stats - статистика студента
app.get('/students/:userId/stats', async (c) => {
    try {
        const { userId } = c.req.param();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });

        if (!user) {
            return c.json({ error: 'Пользователь не найден' }, 404);
        }

        const sessions = await prisma.session.findMany({
            where: {
                userId,
                status: 'completed'
            },
            select: {
                id: true,
                score: true,
                startedAt: true,
                completedAt: true,
                _count: {
                    select: { answers: true }
                }
            },
            orderBy: { completedAt: 'desc' }
        });

        const avgScore = sessions.length ?
            sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length : 0;

        const totalAnswers = await prisma.answer.count({
            where: {
                session: { userId }
            }
        });

        const correctAnswers = await prisma.answer.count({
            where: {
                session: { userId },
                isCorrect: true
            }
        });

        return c.json({
            success: true,
            user,
            stats: {
                totalSessions: sessions.length,
                averageScore: Math.round(avgScore * 100) / 100,
                totalAnswers,
                correctAnswers,
                accuracy: totalAnswers ?
                    Math.round((correctAnswers / totalAnswers) * 100) : 0,
                sessions: sessions.map(s => ({
                    id: s.id,
                    score: s.score,
                    date: s.completedAt,
                    answersCount: s._count.answers
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        return c.json({ error: 'Ошибка при получении статистики студента' }, 500);
    }
});

export default app;
