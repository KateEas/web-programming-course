# LR10: Backend Testing & Validation

## Структура занятия

- **Лекция:** Теоретический блок по качеству backend
  - Материалы: [slides.html](docs/slides-standalone/slides.html)
  - Справочные материалы: [GUIDE.md](docs/GUIDE.md) | [CHEATSHEET.md](docs/CHEATSHEET.md) | [Interactive Examples](docs/interactive.html)

- **Практическая работа:** Объемный блок по тестированию backend

---

## Практическая работа: Доводим Backend до проверяемого состояния

### Цели

По окончании практической работы вы:

1. Настроите тестовую инфраструктуру (`Vitest`, scripts, setup)
2. Покроете бизнес-логику unit-тестами
3. Проверите Zod схемы на корректные и некорректные payload
4. Покроете ключевые API сценарии feature-тестами (`app.request` / `testClient`)
5. Добавите security-проверки по auth/authorization
6. Оцените фактическое coverage и слепые зоны в тестах

### Результат

Backend приложение, которое:

- ✅ Имеет воспроизводимые тесты (`npm run test`, `npm run test:coverage`)
- ✅ Проверяет бизнес-логику изолированно
- ✅ Проверяет API сценарии целиком
- ✅ Корректно обрабатывает ошибки авторизации и валидации
- ✅ Имеет понятный отчёт покрытия

---

## Правило слоя тестов

1. **Unit (co-located рядом с модулем)**

- внешние зависимости мокируются
- в нашем проекте Prisma мокается как частный случай
- тестируется только бизнес-логика

2. **Feature (co-located рядом с route/feature)**

- используется `app.request` или `testClient(app)`
- Prisma не мокается
- проверяется сквозной API сценарий

Теоретически:

- `network e2e smoke` (отдельный процесс + реальный HTTP порт) рассматриваем как тему для LR11, не как обязательную практику LR10.

---

## Инструменты и технологии

| Технология                             | Назначение                             |
| -------------------------------------- | -------------------------------------- |
| **Vitest**                             | Unit и feature тесты                   |
| **Hono (`app.request`, `testClient`)** | Проверка endpoint без внешнего сервера |
| **Zod**                                | Runtime validation и проверки схем     |
| **Prisma**                             | Data layer и test fixtures             |
| **Coverage (v8)**                      | Контроль покрытия                      |
| **Postman / curl**                     | Ручной smoke-check                     |

---

## Рекомендуемая структура

```text
quiz-backend/
├── src/
│   ├── services/
│   │   ├── scoringService.ts
│   │   ├── scoringService.unit.test.ts
│   │   ├── sessionService.ts
│   │   └── sessionService.unit.test.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── auth.feature.test.ts
│   │   ├── sessions.ts
│   │   └── sessions.feature.test.ts
│   └── utils/
│       ├── validation.ts
│       └── validation.unit.test.ts
├── tests/
│   └── setup/
│       ├── test-db.ts
│       └── test-app.ts
├── vitest.config.ts
└── package.json
```

---

## Scripts

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

### Установка зависимостей

```bash
npm install -D vitest @vitest/coverage-v8 vitest-mock-extended
```

Для Hono feature слоя (`app.request` / `testClient`) дополнительных пакетов не требуется.

---

## Checkpoints

### ✅ Checkpoint 0: Test Setup (малый блок)

**Что сделать:**

1. Установить test dependencies
2. Добавить scripts
3. Создать `vitest.config.ts`
4. Подготовить `tests/setup` и базовые helpers

**Проверка:** тестовый раннер стартует и завершается без инфраструктурных ошибок

---

### ✅ Checkpoint 1: Unit + Prisma Mocking (объемный блок)

**Что сделать:**

1. Создать `src/services/scoringService.unit.test.ts`
2. Создать `src/utils/validation.unit.test.ts`
3. Зафиксировать правило мокирования:

- мокируются все внешние зависимости
- Prisma в unit-тестах сервисов мокается всегда
- проверяется логика сервиса и корректные вызовы зависимостей

4. Покрыть edge cases

**Минимум:** не менее 5 unit-тестов

---

### ✅ Checkpoint 2: Feature Tests API Flow (объемный блок)

**Что сделать:**

1. Создать `src/routes/auth.feature.test.ts`
2. Создать `src/routes/sessions.feature.test.ts`
3. Проверить базовые сценарии:

- auth flow
- session flow
- role-based ограничения

4. Использовать подход Hono:

- `app.request(...)` для request/response проверки
- `testClient(app)` при необходимости type-safe маршрутизации

**Минимум:** не менее 3 feature-тестов

---

### ✅ Checkpoint 3: Security и Validation Negative Cases (средний блок)

**Что сделать:**

1. Добавить проверки:

- no token -> `401`
- invalid token -> `401`
- student на admin endpoint -> `403`
- invalid payload -> `400/422`

2. Добавить отдельные negative cases для Zod схем

**Проверка:** security и validation ошибки воспроизводимы и предсказуемы

---

### ✅ Checkpoint 4: Coverage и финальная проверка (средний блок)

**Что сделать:**

1. Запустить coverage

```bash
npm run test:coverage
```

2. Оценить фактическое покрытие по отчёту
3. Зафиксировать непротестированные критичные ветки
4. Выполнить ручной smoke-check через Postman/curl

**Проверка:** отчёт покрытия и ключевые сценарии подтверждены

---

## Типичные проблемы

| Проблема                           | Причина                       | Решение                                              |
| ---------------------------------- | ----------------------------- | ---------------------------------------------------- |
| Тесты нестабильны                  | Общий state между тестами     | Изоляция данных + reset hooks                        |
| `401` вместо `200`                 | Некорректный Bearer token     | Единый helper для auth headers                       |
| Тест проверяет Prisma, а не сервис | Смешаны цели unit и feature   | В unit мокать Prisma, в feature использовать test DB |
| Низкий coverage                    | Проверяется только happy path | Добавить negative и boundary кейсы                   |

---

## Справочные материалы

- [GUIDE.md](docs/GUIDE.md)
- [CHEATSHEET.md](docs/CHEATSHEET.md)
- [slides-speech.md](docs/slides-speech.md)
- [interactive.html](docs/interactive.html)

---

## Дополнительно

- Добавить snapshot проверку стандартного JSON формата ошибок

---

**Цель LR10:** backend должен быть не только рабочим, но и проверенным на уровне кода и сценариев.
