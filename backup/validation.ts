import { z } from 'zod'

// Схема валидации для кода авторизации
export const AuthCodeSchema = z.object({
    code: z.string().min(1, "Code is required")
})

export type AuthCodeInput = z.infer<typeof AuthCodeSchema>

// Типы для GitHub API
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

// Тип для JWT payload
export interface JWTPayload {
    userId: string
    email: string
    exp?: number
    [key: string]: unknown
}