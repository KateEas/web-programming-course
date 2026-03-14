import { PrismaClient } from '@prisma/client';
import { scoringService } from './scoringService.js';

export class SessionService {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {

        this.prisma = prismaClient || new PrismaClient();
    }


    async createSession(userId: string, durationHours: number = 1) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);

        const session = await this.prisma.session.create({
            data: {
                userId,
                expiresAt,
            }
        });

        return session;
    }


    async submitAnswer(sessionId: string, questionId: string, userAnswer: any) {
        return await this.prisma.$transaction(async (tx) => {

            const session = await tx.session.findUnique({
                where: { id: sessionId }
            });

            if (!session) {
                throw new Error('Session not found');
            }

            if (session.status !== 'in_progress') {
                throw new Error('Session is not active');
            }

            if (session.expiresAt < new Date()) {
                await tx.session.update({
                    where: { id: sessionId },
                    data: { status: 'expired' }
                });
                throw new Error('Session expired');
            }


            const question = await tx.question.findUnique({
                where: { id: questionId }
            });

            if (!question) {
                throw new Error('Question not found');
            }


            let score: number | null = null;
            let isCorrect: boolean | null = null;

            if (question.type === 'multiple-select') {
                const correctAnswers = question.correctAnswer
                    ? (question.correctAnswer as unknown as string[])
                    : [];

                score = scoringService.scoreMultipleSelect(correctAnswers, userAnswer);
                isCorrect = score > 0;
            }


            const existingAnswer = await tx.answer.findUnique({
                where: {
                    sessionId_questionId: {
                        sessionId,
                        questionId
                    }
                }
            });

            if (existingAnswer) {
                return await tx.answer.update({
                    where: {
                        sessionId_questionId: {
                            sessionId,
                            questionId
                        }
                    },
                    data: {
                        userAnswer,
                        score,
                        isCorrect
                    }
                });
            } else {
  
                return await tx.answer.create({
                    data: {
                        sessionId,
                        questionId,
                        userAnswer,
                        score,
                        isCorrect
                    }
                });
            }
        });
    }


    async submitSession(sessionId: string) {
        return await this.prisma.$transaction(async (tx) => {
            const session = await tx.session.findUnique({
                where: { id: sessionId },
                include: {
                    answers: {
                        select: {
                            id: true,
                            score: true
                        }
                    }
                }
            });

            if (!session) {
                throw new Error('Session not found');
            }

            const hasUngradedAnswers = session.answers.some(a => a.score === null);

            if (hasUngradedAnswers) {
                throw new Error('Cannot submit session: some answers are not graded yet');
            }

            const totalScore = session.answers.reduce(
                (sum, answer) => sum + (answer.score || 0),
                0
            );

            return await tx.session.update({
                where: { id: sessionId },
                data: {
                    status: 'completed',
                    score: totalScore,
                    completedAt: new Date()
                },
                select: {
                    id: true,
                    status: true,
                    score: true,
                    completedAt: true,
                    userId: true
                }
            });
        });
    }


    async getSession(sessionId: string, userId: string) {
        const session = await this.prisma.session.findFirst({
            where: {
                id: sessionId,
                userId
            },
            include: {
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                text: true,
                                type: true,
                                points: true,
                                category: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new Error('Session not found');
        }

        return session;
    }


    async getQuestions() {
        const questions = await this.prisma.question.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return questions.map(q => ({
            ...q,
            correctAnswer: undefined 
        }));
    }
}


export const sessionService = new SessionService();
