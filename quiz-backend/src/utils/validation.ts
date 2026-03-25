import { z } from 'zod'


export const AuthCodeSchema = z.object({
    code: z.string().min(1, "Code is required")
})

export type AuthCodeInput = z.infer<typeof AuthCodeSchema>


export interface GitHubUser {
    id: number
    login: string
    name: string | null
    email: string | null
}

export interface GitHubEmail {
    email: string
    primary: boolean
    verified: boolean
    visibility: string | null
}


export interface JWTPayload {
    userId: string
    email: string
    exp?: number
    role: string
    [key: string]: unknown
}


export const CreateSessionSchema = z.object({
    durationHours: z.number()
        .min(0.5, "Duration must be at least 0.5 hours")
        .max(24, "Duration cannot exceed 24 hours")
        .optional()
        .default(1)
})

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

// Схема для ответа на вопрос
export const AnswerSchema = z.object({
    questionId: z.string().uuid("Invalid question ID format"),
    userAnswer: z.union([
        z.string().min(1, "Answer cannot be empty"),
        z.array(z.string()).min(1, "Answer cannot be empty")
    ])
})

export type AnswerInput = z.infer<typeof AnswerSchema>

// Схема для оценки эссе
export const GradeSchema = z.object({
    scores: z.array(
        z.number()
            .min(0, "Score cannot be negative")
            .max(100, "Score cannot exceed 100")
    ).min(1, "At least one score is required"),
    feedback: z.string().optional()
})

export type GradeInput = z.infer<typeof GradeSchema>

// Схема для создания вопроса
export const QuestionSchema = z.object({
    text: z.string()
        .min(3, "Question text must be at least 3 characters")
        .max(500, "Question text too long"),
    type: z.enum(['multiple-select', 'essay']),
    categoryId: z.string().uuid("Invalid category ID format"),
    correctAnswer: z.any().optional(),
    points: z.number()
        .min(1, "Points must be at least 1")
        .max(100, "Points cannot exceed 100")
        .default(1)
})

export type QuestionInput = z.infer<typeof QuestionSchema>

// Схема для обновления вопроса
export const UpdateQuestionSchema = QuestionSchema.partial()
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>

// Схема для создания категории
export const CategorySchema = z.object({
    name: z.string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name too long"),
    slug: z.string()
        .min(2, "Slug must be at least 2 characters")
        .max(50, "Slug too long")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
})

export type CategoryInput = z.infer<typeof CategorySchema>

// Схема для пагинации
export const PaginationSchema = z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("20")
})

export type PaginationInput = z.infer<typeof PaginationSchema>
