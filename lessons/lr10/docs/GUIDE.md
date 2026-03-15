# LR10: Backend Testing & Validation

## Полное теоретическое руководство

---

## Оглавление

1. [Почему тестирование backend критично](#почему-тестирование-backend-критично)
2. [Тестовая пирамида для API](#тестовая-пирамида-для-api)
3. [Стратегия мокирования](#стратегия-мокирования)
4. [Настройка Vitest для Node.js backend](#настройка-vitest-для-nodejs-backend)
5. [Co-located структура тестов](#co-located-структура-тестов)
6. [Unit тесты бизнес-логики](#unit-тесты-бизнес-логики)
7. [Validation testing (Zod)](#validation-testing-zod)
8. [Feature testing для Hono endpoints](#feature-testing-для-hono-endpoints)
9. [Network E2E smoke (теория)](#network-e2e-smoke-теория)
10. [Security testing](#security-testing)
11. [Fixtures и тестовые данные](#fixtures-и-тестовые-данные)
12. [Coverage и качество тестов](#coverage-и-качество-тестов)

---

## Почему тестирование backend критично

Backend ошибки дороже frontend ошибок:

- падение endpoint влияет на всех пользователей
- некорректный scoring даёт неверные результаты
- слабая validation создаёт риски данных и доступа
- регрессии в auth критичны для безопасности

Ключевая мысль:

> Без тестов backend «возможно работает». С тестами backend «подтверждённо работает».

---

## Тестовая пирамида для API

### Unit

Проверяют отдельные функции и классы.

### Feature

Проверяют связку модулей в сценарии API (route + middleware + service + validation + data layer).

### Manual smoke

Небольшая ручная проверка API перед сдачей.

Практический baseline LR10: **unit + feature**.

---

## Стратегия мокирования

### Зачем мокировать

- ускорить unit-тесты
- сделать тесты детерминированными
- тестировать свою логику, а не стороннюю библиотеку

### Когда мокировать

- unit-тесты сервисов
- внешние зависимости: БД, HTTP API, очередь, файловая система
- обработка ошибок зависимостей (timeout/exception)

### Когда не мокировать

- feature-тесты сквозных сценариев
- проверка реальной интеграции модулей

### Prisma как частный случай

- unit сервисов: Prisma мокается всегда
- feature слой: Prisma не мокается, используется test DB

---

## Настройка Vitest для Node.js backend

### Зависимости

```bash
npm install -D vitest @vitest/coverage-v8 vitest-mock-extended
```

Для Hono feature тестов (`app.request` / `testClient`) дополнительных пакетов не требуется.

### Минимальный `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
});
```

### Scripts

```json
{
  "scripts": {
    "test:unit": "vitest run \"src/**/*.unit.test.ts\"",
    "test:feature": "vitest run \"src/**/*.feature.test.ts\"",
    "test": "vitest run \"src/**/*.{unit,feature}.test.ts\"",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Co-located структура тестов

Стандарт LR10: тесты рядом с кодом фичи.

```text
src/
  services/
    scoringService.ts
    scoringService.unit.test.ts
  routes/
    auth.ts
    auth.feature.test.ts
  utils/
    validation.ts
    validation.unit.test.ts
tests/
  setup/
    test-db.ts
    test-app.ts
```

Преимущества:

- легче поддерживать при рефакторинге
- тест и код рядом, быстрее навигация
- меньше дублирования контекста

---

## Unit тесты бизнес-логики

Unit-тесты пишутся без HTTP и без реальной БД.

### Prisma mock шаблон

```ts
import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

const prismaMock = mockDeep<PrismaClient>();
vi.mock("../../src/db/client", () => ({ prisma: prismaMock }));

beforeEach(() => {
  mockReset(prismaMock);
});
```

### Что обязательно покрыть

- happy path
- negative path
- boundary values
- edge cases

---

## Validation testing (Zod)

Zod схемы тестируются отдельно, чтобы ошибки входных данных были предсказуемыми.

```ts
const result = AnswerSchema.safeParse(validPayload);
expect(result.success).toBe(true);

const bad = AnswerSchema.safeParse(invalidPayload);
expect(bad.success).toBe(false);
```

Используйте `safeParse`, чтобы не писать `try/catch` в каждом тесте.

---

## Feature testing для Hono endpoints

Feature тесты в Hono:

- `app.request(...)`
- `testClient(app)` из `hono/testing` для type-safe вызовов

### Пример

```ts
const res = await app.request("/api/auth/github/callback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "test_ok" }),
});

expect(res.status).toBe(200);
expect((await res.json()).token).toBeTypeOf("string");
```

Feature слой проверяет не только status code, но и API контракт.

---

## Network E2E smoke (теория)

Network E2E smoke — отдельный процесс и реальный HTTP порт.

Для LR10 это **теоретический блок**, не обязательная практика.

---

## Security testing

Минимальный checklist:

1. Нет токена -> `401`
2. Невалидный токен -> `401`
3. Недостаточно прав -> `403`
4. Некорректный payload -> `400/422`

---

## Fixtures и тестовые данные

Рекомендации:

- использовать фабрики payload
- не дублировать JSON вручную в каждом тесте
- держать тестовые данные детерминированными

---

## Coverage и качество тестов

Coverage — индикатор слепых зон, а не самоцель.

Для LR10:

- фиксируем фактическое покрытие и смотрим слепые зоны
- есть negative cases
- unit и feature оба поддерживаются
