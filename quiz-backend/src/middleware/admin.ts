import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';
import { handleError, throwError } from '../utils/errors.js';


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

export async function requireAdmin(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) 
        throwError("Unauthorized - No token provided");


    const token = authHeader.split(' ')[1];

    try {
        // Проверяем JWT токен
        const payload = await verify(token, JWT_SECRET, 'HS256');

        // Получаем пользователя из БД
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, role: true, name: true, email: true }
        });

        if (!user) throwError("User not found");

        if (user.role !== 'admin')throw new Error("Forbidden - Admin access required");

        c.set('user', user);

        await next();
    } catch (error) {
        return handleError(c, error);
    }
}
