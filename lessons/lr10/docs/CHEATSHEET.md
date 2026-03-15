# LR10: Backend Testing & Validation

## Cheatsheet

Короткие шаблоны для практики LR10.

---

## 1. Установка

```bash
npm install -D vitest @vitest/coverage-v8 vitest-mock-extended
```

---

## 2. Scripts

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

## 3. Vitest config

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

---

## 4. Co-located naming

- `src/services/scoringService.unit.test.ts`
- `src/routes/auth.feature.test.ts`
- `src/utils/validation.unit.test.ts`

---

## 5. Mocking правило

- Unit: мокируются внешние зависимости
- Feature: сквозной сценарий без моков Prisma
- Prisma в этом проекте:
  - unit сервисов: mock
  - feature: test DB

---

## 6. Prisma mock (unit)

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

---

## 7. Unit тест (пример)

```ts
it("should apply penalty for wrong answers", () => {
  const score = service.scoreMultipleSelect(["A", "C"], ["A", "B"]);
  expect(score).toBe(0.5);
});
```

---

## 8. Feature тест Hono (`app.request`)

```ts
const res = await app.request("/api/auth/github/callback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "test_ok" }),
});

expect(res.status).toBe(200);
expect((await res.json()).token).toBeTypeOf("string");
```

---

## 9. Feature тест Hono (`testClient`)

```ts
import { testClient } from "hono/testing";

const client = testClient(app);
const res = await client.api.auth.me.$get();
expect(res.status).toBe(200);
```

---

## 10. Validation (Zod)

```ts
const ok = AnswerSchema.safeParse(validPayload);
expect(ok.success).toBe(true);

const bad = AnswerSchema.safeParse(invalidPayload);
expect(bad.success).toBe(false);
```

---

## 11. Security checks

```ts
expect(noTokenRes.status).toBe(401);
expect(invalidTokenRes.status).toBe(401);
expect(forbiddenRes.status).toBe(403);
expect(invalidPayloadRes.status).toBe(400);
```

---

## 12. Coverage

```bash
npm run test:coverage
```

Цель в LR10: оценить фактическое покрытие и найти непротестированные зоны.
