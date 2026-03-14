import { describe, it, expect } from 'vitest'
import { AnswerSchema, CreateSessionSchema, QuestionSchema } from './validation.js'

describe('Validation Schemas', () => {
    describe('CreateSessionSchema', () => {
        it('валидирует корректные данные', () => {
            const result = CreateSessionSchema.safeParse({ durationHours: 2 })
            expect(result.success).toBe(true)
        })

        it('принимает значение по умолчанию', () => {
            const result = CreateSessionSchema.safeParse({})
            expect(result.success).toBe(true)
            expect(result.data?.durationHours).toBe(1)
        })

        it('отклоняет durationHours < 0.5', () => {
            const result = CreateSessionSchema.safeParse({ durationHours: 0.2 })
            expect(result.success).toBe(false)
        })

        it('отклоняет durationHours > 24', () => {
            const result = CreateSessionSchema.safeParse({ durationHours: 25 })
            expect(result.success).toBe(false)
        })

        it('отклоняет нечисловые значения', () => {
            const result = CreateSessionSchema.safeParse({ durationHours: '2' })
            expect(result.success).toBe(false)
        })
    })

    describe('AnswerSchema', () => {
        it('валидирует multiple-select ответ', () => {
            const result = AnswerSchema.safeParse({
                questionId: '123e4567-e89b-12d3-a456-426614174000',
                userAnswer: ['A', 'B', 'C']
            })
            expect(result.success).toBe(true)
        })

        it('валидирует essay ответ', () => {
            const result = AnswerSchema.safeParse({
                questionId: '123e4567-e89b-12d3-a456-426614174000',
                userAnswer: 'Это текстовый ответ'
            })
            expect(result.success).toBe(true)
        })

        it('отклоняет неверный UUID', () => {
            const result = AnswerSchema.safeParse({
                questionId: 'не-uuid',
                userAnswer: ['A']
            })
            expect(result.success).toBe(false)
        })

        it('отклоняет пустой ответ', () => {
            const result = AnswerSchema.safeParse({
                questionId: '123e4567-e89b-12d3-a456-426614174000',
                userAnswer: []
            })
            expect(result.success).toBe(false)
        })

        it('отклоняет пустую строку', () => {
            const result = AnswerSchema.safeParse({
                questionId: '123e4567-e89b-12d3-a456-426614174000',
                userAnswer: ''
            })
            expect(result.success).toBe(false)
        })
    })

    describe('QuestionSchema', () => {
        it('валидирует multiple-select вопрос', () => {
            const result = QuestionSchema.safeParse({
                text: 'Тестовый вопрос',
                type: 'multiple-select',
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
                correctAnswer: ['A', 'B'],
                points: 10
            })
            expect(result.success).toBe(true)
        })

        it('валидирует essay вопрос', () => {
            const result = QuestionSchema.safeParse({
                text: 'Тестовый вопрос',
                type: 'essay',
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
                correctAnswer: { criteria1: 5, criteria2: 3 },
                points: 8
            })
            expect(result.success).toBe(true)
        })

        it('отклоняет текст короче 3 символов', () => {
            const result = QuestionSchema.safeParse({
                text: 'AB',
                type: 'multiple-select',
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
                points: 5
            })
            expect(result.success).toBe(false)
        })
    })
})
