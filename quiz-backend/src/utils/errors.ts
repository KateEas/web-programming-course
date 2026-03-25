import { Context } from 'hono';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function handleError(c: Context, error: unknown): Response {
  console.error('❌ Error:', error);

  if (error instanceof ZodError) {
    return c.json({ 
      error: 'Ошибка валидации', 
      details: error.format
    }, 400);
  }

  if (error instanceof HttpError) {
    return c.json({ error: error.message }, error.status as any);
  }

  if (error instanceof Error) {
    return c.json({ error: error.message }, 400);
  }

  // Всё остальное
  return c.json({ error: 'Внутренняя ошибка сервера' }, 500);
}

export function throwError(message: string): never {
  throw new HttpError(message, 400);
}

export function throwUnauthorized(message: string = 'Не авторизован'): never {
  throw new HttpError(message, 401);
}

export function throwForbidden(message: string = 'Доступ запрещен'): never {
  throw new HttpError(message, 403);
}

export function throwNotFound(message: string = 'Ресурс не найден'): never {
  throw new HttpError(message, 404);}

