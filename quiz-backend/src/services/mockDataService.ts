import {
    mockCategories,
    mockQuestions,
    mockQuestionsWithAnswers,
    mockSessions,
    mockAnswers
} from '../data/mockData.js'
import { scoringService } from './scoringService.js'

// Интерфейсы для типизации
interface EssayRubric {
    definition: number;
    formula?: number;
    example?: number;
    methods?: number;
    examples?: number;
    states?: number;
    usage?: number;
}

export class MockDataService {
    // ===== КАТЕГОРИИ =====
    async getCategories() {
        return mockCategories
    }

    async getCategoryById(id: string) {
        return mockCategories.find(c => c.id === id)
    }

    // ===== ВОПРОСЫ =====
    async getQuestions() {
        // Для студентов - без правильных ответов
        return mockQuestions
    }

    async getQuestionsWithAnswers() {
        // Для админа - с правильными ответами
        return mockQuestionsWithAnswers
    }

    async getQuestionById(id: string) {
        return mockQuestions.find(q => q.id === id)
    }

    async getQuestionWithAnswersById(id: string) {
        return mockQuestionsWithAnswers.find(q => q.id === id)
    }

    // ===== СЕССИИ =====
    async createSession(userId: string, durationHours: number = 1) {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + durationHours)

        const session = {
            id: `session-${Date.now()}`,
            userId,
            status: 'in_progress',
            score: null,
            startedAt: new Date(),
            expiresAt,
            completedAt: null,
            answers: []
        }

        mockSessions.push(session)
        return session
    }

    async getSessionById(id: string, userId: string) {
        const session = mockSessions.find(s => s.id === id && s.userId === userId)
        if (!session) return null

        // Добавляем ответы к сессии
        const answers = mockAnswers
            .filter(a => a.sessionId === id)
            .map(answer => {
                const question = mockQuestions.find(q => q.id === answer.questionId)
                return {
                    ...answer,
                    question: question || null
                }
            })

        return { ...session, answers }
    }

    // ===== ОТВЕТЫ =====
    async submitAnswer(sessionId: string, questionId: string, userAnswer: any) {
        // Проверяем сессию
        const session = mockSessions.find(s => s.id === sessionId)
        if (!session) throw new Error('Session not found')
        if (session.status !== 'in_progress') throw new Error('Session is not active')
        if (session.expiresAt < new Date()) throw new Error('Session expired')

        // Проверяем вопрос
        const question = mockQuestionsWithAnswers.find(q => q.id === questionId)
        if (!question) throw new Error('Question not found')

        // Проверяем, не отвечали ли уже
        const existingAnswerIndex = mockAnswers.findIndex(
            a => a.sessionId === sessionId && a.questionId === questionId
        )

        // Вычисляем баллы
        let score = null
        let isCorrect = null

        if (question.type === 'multiple-select' && question.correctAnswer) {
            const correctAnswers = question.correctAnswer as string[]
            const studentAnswers = userAnswer as string[]

            score = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers)
            isCorrect = score > 0
        }

        const answer = {
            id: `answer-${Date.now()}-${Math.random()}`,
            sessionId,
            questionId,
            userAnswer,
            score,
            isCorrect,
            createdAt: new Date()
        }

        if (existingAnswerIndex >= 0) {
            // Обновляем существующий ответ
            mockAnswers[existingAnswerIndex] = answer
            return answer
        } else {
            // Создаем новый ответ
            mockAnswers.push(answer)
            return answer
        }
    }

    async submitSession(sessionId: string) {
        const sessionIndex = mockSessions.findIndex(s => s.id === sessionId)
        if (sessionIndex === -1) throw new Error('Session not found')

        const session = mockSessions[sessionIndex]
        if (session.status !== 'in_progress') throw new Error('Session already completed')

        const answers = mockAnswers.filter(a => a.sessionId === sessionId)
        const hasUngraded = answers.some(a => a.score === null)

        if (hasUngraded) {
            throw new Error('Cannot submit: some answers not graded')
        }

        const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0)

        session.status = 'completed'
        session.score = totalScore
        session.completedAt = new Date()

        return session
    }

    // ===== СТАТИСТИКА =====
    async getStats() {
        const completedSessions = mockSessions.filter(s => s.status === 'completed')
        const avgScore = completedSessions.length
            ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
            : 0

        return {
            totalUsers: 2, // student + teacher из моков
            totalSessions: mockSessions.length,
            totalQuestions: mockQuestions.length,
            completedSessions: completedSessions.length,
            pendingGrading: mockAnswers.filter(a => a.score === null).length,
            averageScore: Math.round(avgScore * 100) / 100,
            completionRate: mockSessions.length
                ? Math.round((completedSessions.length / mockSessions.length) * 100)
                : 0
        }
    }

    // ===== АДМИН ФУНКЦИИ =====
    async getPendingAnswers() {
        return mockAnswers
            .filter(a => a.score === null)
            .map(answer => {
                const question = mockQuestionsWithAnswers.find(q => q.id === answer.questionId)
                const session = mockSessions.find(s => s.id === answer.sessionId)
                return {
                    ...answer,
                    question,
                    session
                }
            })
    }

    async gradeAnswer(answerId: string, scores: number[], feedback?: string) {
        const answerIndex = mockAnswers.findIndex(a => a.id === answerId)
        if (answerIndex === -1) throw new Error('Answer not found')

        const answer = mockAnswers[answerIndex]
        const question = mockQuestionsWithAnswers.find(q => q.id === answer.questionId)

        if (!question || question.type !== 'essay') {
            throw new Error('Can only grade essay answers')
        }

        // Безопасное приведение типа для рубрики эссе
        const rubric = question.correctAnswer as unknown as Record<string, number> || {}
        const totalScore = scoringService.scoreEssay(scores, rubric)

        answer.score = totalScore
        answer.isCorrect = totalScore > 0

        return answer
    }
}

export const mockDataService = new MockDataService()
