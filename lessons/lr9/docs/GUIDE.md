# LR9: Database & Business Logic - Scoring Algorithm
## Полное теоретическое руководство

---

## Оглавление

0. [Project Architecture](#project-architecture)
1. [Введение](#введение)
2. [Advanced Prisma](#advanced-prisma)
3. [Scoring Algorithm](#scoring-algorithm)
4. [Database Optimization](#database-optimization)
5. [Admin endpoints](#admin-endpoints)
6. [Best Practices](#best-practices)
7. [Архитектура: Services Layer](#архитектура-services-layer)

---

## Project Architecture

**Смотрите слайды LR9 (слайды 4-7) для подробного объяснения!**

Когда логика вашего backend'а растёт, нужна правильная архитектура. На LR9 мы используем **Service Layer Pattern**.

### Структура проекта

```
quiz-backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/               # HTTP handlers (req/res)
│   │   ├── auth.ts           # Аутентификация
│   │   ├── sessions.ts       # Сессии квиза
│   │   └── admin.ts          # Admin endpoints
│   ├── services/             # Бизнес-логика
│   │   ├── scoringService.ts # Подсчёт баллов
│   │   ├── sessionService.ts # Управление сессиями
│   │   └── index.ts          # Инициализация сервисов
│   ├── middleware/           # JWT, валидация
│   └── utils/                # Helpers
├── prisma/
│   └── schema.prisma         # Database models
```

### Разделение ответственности

- **routes/** — HTTP слой (получить запрос, вернуть ответ, status codes)
- **services/** — Бизнес-логика (scoring, session management, validation)
- **middleware/** — Защита и валидация
- **utils/** — Вспомогательные функции

### Почему это важно?

1. **Тестируемость**: Можно тестировать сервисы без HTTP запросов
2. **Переиспользование**: Один сервис может использоваться в разных routes
3. **Читаемость**: Route handlers остаются простыми и понятными
4. **Масштабируемость**: Легче добавлять новый функционал

---

## Введение

После прохождения LR8 у вас есть базовый backend с CRUD операциями. Но это только начало.

**На LR9 вы углубляетесь в:**
- **Business Logic** — правила которые делают приложение полезным
- **Data Consistency** — гарантия что данные всегда корректны
- **Performance** — как писать быстрые queries
- **Admin Tools** — как давать контроль пользователям

### Контекст: Quiz Application

Мы используем Quiz приложение как пример. Основная бизнес-логика:

1. Студент начинает сессию квиза
2. Студент отвечает на вопросы (разных типов)
3. Система считает баллы
4. Преподаватель может проверить essay ответы
5. Система выдаёт результаты

Каждый из этих шагов требует правильной логики и оптимизации.

---

## Advanced Prisma

### Relationships (Связи между таблицами)

#### Одна таблица → Много связанных

**One-to-Many (Один-ко-многим)** — самая частая связь.

Пример: Один User может иметь много Sessions.

**Schema:**

```prisma
model User {
  id       String    @id @default(cuid())
  name     String
  email    String    @unique

  // Связь: один User -> много Sessions
  sessions Session[]

  @@map("users")
}

model Session {
  id        String    @id @default(cuid())
  userId    String    // Foreign key
  user      User      @relation(fields: [userId], references: [id])

  // Связь: много Sessions -> один User
  @@index([userId])

  @@map("sessions")
}
```

**Что произошло:**

- Prisma создала foreign key в таблице `sessions`
- Добавила индекс на `userId` для быстрого поиска
- Теперь вы можете делать queries со связями:

```typescript
// Получить юзера со всеми его сессиями
const user = await prisma.user.findUnique({
  where: { id: "user1" },
  include: { sessions: true }
});
// user.sessions // массив всех сессий для этого юзера

// Получить сессию с информацией о юзере
const session = await prisma.session.findUnique({
  where: { id: "session1" },
  include: { user: true }
});
// session.user // объект User
```

**Важное отличие:**

```typescript
// ❌ НЕПРАВИЛЬНО - не загружает related данные
const session = await prisma.session.findUnique({
  where: { id: "session1" }
});
// session.user // undefined!
// session.userId // есть, это ID

// ✅ ПРАВИЛЬНО - загружает связь
const session = await prisma.session.findUnique({
  where: { id: "session1" },
  include: { user: true }
});
// session.user // объект User
```

#### Много таблиц → Много связанных

**Many-to-Many (Много-ко-многим)** — например, Question имеет много Tags, и каждый Tag может быть у много Questions.

**Schema:**

```prisma
model Question {
  id        String   @id @default(cuid())
  text      String
  type      String   // "multiple-select", "essay"

  // Связь: Question -> много Tags
  tags      Tag[]

  @@map("questions")
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique

  // Связь: Tag -> много Questions
  questions Question[]

  @@map("tags")
}
```

Prisma **автоматически** создаст таблицу `_QuestionToTag` (связь many-to-many):

```
_QuestionToTag
├─ questionId (foreign key -> questions.id)
└─ tagId (foreign key -> tags.id)
```

**Использование:**

```typescript
// Создать Question с Tags
const q = await prisma.question.create({
  data: {
    text: "What is React?",
    type: "multiple-select",
    tags: {
      connect: [
        { id: "tag1" },  // подключить существующий Tag
        { id: "tag2" }
      ]
    }
  }
});

// Получить Question со всеми Tags
const q = await prisma.question.findUnique({
  where: { id: "q1" },
  include: { tags: true }
});
// q.tags // массив Tags

// Получить все Questions с конкретным Tag
const questions = await prisma.question.findMany({
  where: {
    tags: {
      some: { id: "tag1" }  // "some" = есть хотя бы один
    }
  }
});
```

### Transactions (Транзакции)

**Транзакция** — это последовательность операций которые либо ВСЕ выполняются, либо НИЧЕГО не выполняется.

#### Зачем нужны?

Пример без транзакций (ПЛОХО):

```typescript
// Без гарантий atomicity
async function submitSession(sessionId: string) {
  // Шаг 1: Считаем баллы
  const answers = await prisma.answer.findMany({ where: { sessionId } });
  const score = answers.reduce((sum, a) => sum + (a.score || 0), 0);

  // ОШИБКА МОЖЕТ БЫТЬ ЗДЕСЬ (например, сетевая ошибка)

  // Шаг 2: Обновляем Session
  await prisma.session.update({
    where: { id: sessionId },
    data: { score, status: "completed" }
  });

  // Если на шаге между 1 и 2 произойдёт ошибка,
  // мы потеряем calculated score!
}
```

**Решение: Транзакция**

```typescript
async function submitSession(sessionId: string) {
  // Либо ВСЕ операции выполняются, либо НИЧЕГО
  const result = await prisma.$transaction(async (tx) => {
    // Все операции внутри используют `tx` вместо `prisma`
    const answers = await tx.answer.findMany({ where: { sessionId } });
    const score = answers.reduce((sum, a) => sum + (a.score || 0), 0);

    const session = await tx.session.update({
      where: { id: sessionId },
      data: { score, status: "completed" }
    });

    return session;
  });

  return result;
}
```

**Гарантии Prisma:**

- ✅ Если любая операция упадёт — **ВСЕ откатываются**
- ✅ Никакая другая операция не может прерваться между шагами
- ✅ Данные всегда консистентны

#### Когда использовать?

```typescript
// ✅ Используйте транзакции
- Критичные операции (платежи, оценки)
- Операции которые должны быть атомарные
- Когда несколько таблиц должны измениться вместе

// ❌ Не нужны транзакции
- SELECT-only операции
- Независимые updates
- Простые создания записей
```

### Performance: Select vs Include

#### Select — выбрать только нужные поля

**Problem:**

```typescript
// ❌ Загружает ВСЕ поля
const sessions = await prisma.session.findMany();
// session = {
//   id, userId, status, score, createdAt,
//   updatedAt, expiresAt, currentQuestionIndex, totalQuestions
// }

// Если каждый сессия 500 байт, и их 10,000 — это 5 MB!
```

**Solution:**

```typescript
// ✅ Загружает только нужные поля
const sessions = await prisma.session.findMany({
  select: {
    id: true,
    score: true,
    status: true
  }
});
// session = { id, score, status }  // 50 байт вместо 500!
```

#### Include — загрузить связанные данные

```typescript
// ❌ Плохо: N+1 problem
const sessions = await prisma.session.findMany();
for (const session of sessions) {
  // На каждую сессию — отдельный query!
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });
  console.log(user.name);
}
// 1 + 10,000 = 10,001 query! Очень медленно.

// ✅ Правильно: один query со связью
const sessions = await prisma.session.findMany({
  include: {
    user: true  // загружает пользователя в одном query
  }
});
for (const session of sessions) {
  console.log(session.user.name);
}
// 1 query вместо 10,001!
```

#### Комбинирование Select + Include

```typescript
const sessions = await prisma.session.findMany({
  select: {
    id: true,
    score: true,
    user: {
      select: {
        name: true,
        email: true
        // НЕ загружаем password, tokens и т.д.
      }
    }
  }
});
```

### Batch Operations

Когда нужно создать или обновить много записей.

```typescript
// ❌ Плохо: 1000 отдельных queries
for (const questionData of questions) {
  await prisma.question.create({ data: questionData });
}

// ✅ Правильно: 1 query
await prisma.question.createMany({
  data: questions,
  skipDuplicates: true // пропустить дубликаты
});

// Также для обновления
await prisma.answer.updateMany({
  where: { sessionId: "session1" },
  data: { status: "graded" }
});
```

---

## Scoring Algorithm

### Multiple-Select Questions

**Multiple-select** — вопрос где может быть несколько правильных ответов, и студент выбирает несколько вариантов.

#### Правила подсчёта

Существует несколько стратегий. Вот наиболее справедливая:

```
За каждый правильно выбранный ответ: +1 балл
За каждый неправильно выбранный ответ: -0.5 балла
Минимум: 0 баллов
```

#### Примеры

**Пример 1: Студент выбрал частично правильно**

```
Правильные ответы: A, C, D (3 правильных)
Студент выбрал: A, C (2 правильных, 0 неправильных)

Расчёт:
- A: правильно → +1
- C: правильно → +1
- Остальные не выбраны

Сумма: 1 + 1 = 2 балла из 3 максимум
```

**Пример 2: Студент выбрал часть правильно, часть неправильно**

```
Правильные ответы: A, C, D
Студент выбрал: A, B, C (2 правильных, 1 неправильный)

Расчёт:
- A: правильно → +1
- B: неправильно → -0.5
- C: правильно → +1

Сумма: 1 - 0.5 + 1 = 1.5 баллов
```

**Пример 3: Студент выбрал только неправильно**

```
Правильные ответы: A, C, D
Студент выбрал: B, E (0 правильных, 2 неправильных)

Расчёт:
- B: неправильно → -0.5
- E: неправильно → -0.5

Сумма: -0.5 - 0.5 = -1, но минимум 0 → 0 баллов
```

#### Реализация

```typescript
function scoreMultipleSelect(
  correctAnswers: string[],
  studentAnswers: string[]
): number {
  let score = 0;

  // За каждый выбранный ответ
  for (const answer of studentAnswers) {
    if (correctAnswers.includes(answer)) {
      score += 1; // правильный
    } else {
      score -= 0.5; // неправильный
    }
  }

  // Минимум 0 баллов
  return Math.max(0, score);
}

// Использование
const score = scoreMultipleSelect(
  ["A", "C", "D"],
  ["A", "B", "C"]
);
// score = 1.5
```

#### Нормализация к максимуму

Если вопрос стоит например 10 баллов, нужно нормализовать:

```typescript
function scoreMultipleSelectNormalized(
  correctAnswers: string[],
  studentAnswers: string[],
  maxPoints: number = 10
): number {
  let rawScore = 0;

  for (const answer of studentAnswers) {
    rawScore += correctAnswers.includes(answer) ? 1 : -0.5;
  }

  // rawScore может быть от 0 до correctAnswers.length
  // Нормализуем к maxPoints
  const maxRawScore = correctAnswers.length;
  const normalized = (rawScore / maxRawScore) * maxPoints;

  // Убедиться что в пределах [0, maxPoints]
  return Math.max(0, Math.min(maxPoints, normalized));
}
```

### Essay Questions

**Essay** (развёрнутые текстовые ответы) не могут быть оценены автоматически.

#### Rubric-based Scoring

**Rubric** (рубрика) — это набор критериев оценки.

**Пример рубрики для вопроса "Объясни как работает React":**

```json
{
  "criteria": [
    {
      "name": "Understanding of React",
      "description": "Student explains what React is and its purpose",
      "maxPoints": 3
    },
    {
      "name": "Components and JSX",
      "description": "Student explains components and JSX syntax",
      "maxPoints": 3
    },
    {
      "name": "State and Props",
      "description": "Student explains state and props concepts",
      "maxPoints": 2
    },
    {
      "name": "Code Examples",
      "description": "Student provides working code examples",
      "maxPoints": 2
    }
  ]
}
```

#### Процесс оценивания

Преподаватель читает ответ и выставляет баллы по каждому критерию:

```typescript
interface Grade {
  criterion: string;
  points: number;
  feedback?: string;
}

// Преподаватель выставляет
const grades: Grade[] = [
  { criterion: "Understanding of React", points: 3, feedback: "Excellent explanation" },
  { criterion: "Components and JSX", points: 2, feedback: "Good, but missing some details" },
  { criterion: "State and Props", points: 1, feedback: "Incomplete" },
  { criterion: "Code Examples", points: 0, feedback: "No examples provided" }
];

// Финальный score = 3 + 2 + 1 + 0 = 6 из 10
```

#### Реализация

```typescript
interface Rubric {
  criterion: string;
  maxPoints: number;
}

function scoreEssay(
  grades: Grade[],
  rubric: Rubric[]
): number {
  let totalScore = 0;

  for (const grade of grades) {
    const criterion = rubric.find(r => r.criterion === grade.criterion);
    if (!criterion) continue;

    // Убедиться что баллы не превышают максимум
    const points = Math.min(grade.points, criterion.maxPoints);
    totalScore += points;
  }

  return totalScore;
}
```

### Session Management

**Session** — объект который отслеживает прогресс студента в квизе.

#### Состояния Session

```
START → in_progress → SUBMIT → completed
        ↓
        TIMEOUT → expired
```

#### Model в Prisma

```prisma
model Session {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  // Статус
  status          String    @default("in_progress") // "in_progress", "completed", "expired"

  // Сроки
  startedAt       DateTime  @default(now())
  expiresAt       DateTime  // время когда квиз автоматически завершается

  // Результаты
  score           Int?      // null пока не завершена, или есть unchecked essay answers

  // Связь к ответам
  answers         Answer[]

  @@index([userId])
  @@index([status])

  @@map("sessions")
}

model Answer {
  id          String    @id @default(cuid())
  sessionId   String
  session     Session   @relation(fields: [sessionId], references: [id])
  questionId  String
  question    Question  @relation(fields: [questionId], references: [id])

  // Ответ студента
  userAnswer  Json      // может быть массив (multiple-select) или текст (essay)

  // Score
  score       Int?      // null = не проверено (особенно для essay)
  feedback    String?   // комментарий преподавателя

  createdAt   DateTime  @default(now())

  @@index([sessionId])
  @@index([questionId])

  @@map("answers")
}
```

#### Жизненный цикл

**Начало:**

```typescript
async function startSession(userId: string, quizId: string) {
  // Получить все вопросы для этого квиза
  const questions = await prisma.question.findMany({
    where: { quizId }
  });

  // Создать сессию
  return await prisma.session.create({
    data: {
      userId,
      status: "in_progress",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60 минут
      quizId
    }
  });
}
```

**Отправка ответа:**

```typescript
async function submitAnswer(
  sessionId: string,
  questionId: string,
  userAnswer: any
) {
  // Проверить что сессия ещё активна
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (session.status !== "in_progress") {
    throw new Error("Session is not active");
  }

  if (session.expiresAt < new Date()) {
    // Автоматически завершить сессию
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "expired" }
    });
    throw new Error("Session expired");
  }

  // Получить вопрос
  const question = await prisma.question.findUnique({
    where: { id: questionId }
  });

  // Считаем score если возможно
  let score = null;
  if (question.type === "multiple-select") {
    score = scoreMultipleSelect(
      question.correctAnswers as string[],
      userAnswer as string[]
    );
  }
  // Для essay: score остаётся null (ждёт проверки)

  // Сохраняем ответ
  return await prisma.answer.create({
    data: {
      sessionId,
      questionId,
      userAnswer,
      score
    }
  });
}
```

**Завершение сессии:**

```typescript
async function submitSession(sessionId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Получить сессию со всеми ответами
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: { answers: true }
    });

    // Проверить что сессия всё ещё активна
    if (session.status !== "in_progress") {
      throw new Error("Session is not in progress");
    }

    if (session.expiresAt < new Date()) {
      throw new Error("Session expired");
    }

    // Считаем финальный score (только ответы которые проверены)
    const score = session.answers
      .filter(a => a.score !== null)
      .reduce((sum, a) => sum + (a.score || 0), 0);

    // Обновляем сессию
    return await tx.session.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        score
      }
    });
  });

  return result;
}
```

---

## Database Optimization

### Индексы

**Индекс** — это структура БД которая ускоряет поиск.

```prisma
model Session {
  id        String  @id @default(cuid())
  userId    String
  status    String
  createdAt DateTime @default(now())

  // Одиночные индексы
  @@index([userId])     // fast lookup by userId
  @@index([status])     // fast lookup by status

  // Комбинированный индекс
  @@index([userId, status]) // fast lookup by both
}
```

**Когда добавлять индексы:**

```
✅ Часто используемые в WHERE условиях
✅ Foreign keys (автоматически от Prisma)
✅ Поля используемые для сортировки (ORDER BY)
✅ Комбинирующие поля (userId + status)

❌ Не нужны индексы для каждого поля!
❌ Индексы замедляют создание/обновление
```

### Пагинация

Не загружайте всё сразу!

```typescript
// ❌ Плохо
const sessions = await prisma.session.findMany();
// Если миллион сессий — ждать долго и много памяти

// ✅ Правильно
const page = 1;
const limit = 20;

const sessions = await prisma.session.findMany({
  skip: (page - 1) * limit,  // пропустить записи
  take: limit,               // взять 20
  orderBy: { createdAt: 'desc' }
});

// Можно также получить количество
const total = await prisma.session.count();
const pages = Math.ceil(total / limit);
```

### Query Optimization

```typescript
// ❌ Неоптимально
const sessions = await prisma.session.findMany({
  include: {
    answers: {
      include: {
        question: {
          include: {
            category: true
          }
        }
      }
    },
    user: true
  }
});
// Слишком много связей, очень медленно

// ✅ Оптимально
const sessions = await prisma.session.findMany({
  select: {
    id: true,
    score: true,
    status: true,
    user: {
      select: { name: true, email: true }
    }
  },
  // answers НЕ загружаем здесь
  // Загружаем отдельно если нужно
});

// Если нужны answers
const answers = await prisma.answer.findMany({
  where: { sessionId: sessions[0].id },
  select: {
    id: true,
    userAnswer: true,
    score: true
  }
});
```

---

## Admin endpoints

### Управление вопросами (CRUD)

```typescript
// CREATE - создать вопрос
app.post('/api/admin/questions', async (c) => {
  const body = await c.req.json();
  const question = await prisma.question.create({
    data: body
  });
  return c.json({ question }, 201);
});

// READ - получить все вопросы
app.get('/api/admin/questions', async (c) => {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      type: true,
      _count: { select: { answers: true } }
    }
  });
  return c.json({ questions });
});

// UPDATE - обновить вопрос
app.put('/api/admin/questions/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const question = await prisma.question.update({
    where: { id },
    data: body
  });
  return c.json({ question });
});

// DELETE - удалить вопрос
app.delete('/api/admin/questions/:id', async (c) => {
  const { id } = c.req.param();
  await prisma.question.delete({ where: { id } });
  return c.json({ success: true });
});
```

### Оценивание Essay ответов

```typescript
// Получить unchecked essay answers
app.get('/api/admin/grading/pending', async (c) => {
  const answers = await prisma.answer.findMany({
    where: {
      score: null,
      question: { type: "essay" }
    },
    include: {
      question: true,
      session: {
        include: { user: true }
      }
    }
  });
  return c.json({ answers });
});

// Выставить оценку
app.post('/api/admin/answers/:id/grade', async (c) => {
  const { id } = c.req.param();
  const { score, feedback } = await c.req.json();

  const result = await prisma.$transaction(async (tx) => {
    // Обновить ответ
    const answer = await tx.answer.update({
      where: { id },
      data: { score, feedback }
    });

    // Проверить что все ответы в сессии проверены
    const session = await tx.session.findUnique({
      where: { id: answer.sessionId },
      include: { answers: true }
    });

    const allGraded = session.answers.every(a => a.score !== null);

    // Если все проверены — обновить финальный score
    if (allGraded) {
      const totalScore = session.answers.reduce(
        (sum, a) => sum + (a.score || 0),
        0
      );
      await tx.session.update({
        where: { id: answer.sessionId },
        data: {
          score: totalScore,
          status: "completed"
        }
      });
    }

    return answer;
  });

  return c.json({ answer: result });
});
```

### Reporting

```typescript
// Статистика студента
app.get('/api/admin/students/:userId/stats', async (c) => {
  const { userId } = c.req.param();

  const sessions = await prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      status: true,
      startedAt: true,
      _count: { select: { answers: true } }
    },
    orderBy: { startedAt: 'desc' }
  });

  const avgScore = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
    : 0;

  return c.json({
    userId,
    totalSessions: sessions.length,
    averageScore: Math.round(avgScore),
    sessions
  });
});

// Лидерборд
app.get('/api/admin/leaderboard', async (c) => {
  const results = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      AVG(s.score) as average_score,
      COUNT(s.id) as session_count
    FROM users u
    LEFT JOIN sessions s ON u.id = s."userId"
    GROUP BY u.id
    ORDER BY average_score DESC
    LIMIT 10
  `;

  return c.json({ results });
});
```

---

## Best Practices

### 1. Валидация всё и везде

```typescript
import { z } from 'zod';

const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  userAnswer: z.union([
    z.array(z.string()),  // multiple-select
    z.string()             // essay
  ])
});

app.post('/api/sessions/:id/answers', async (c) => {
  const body = await c.req.json();
  const parsed = AnswerSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // ... обработка
});
```

### 2. Использовать transactions для критичных операций

```typescript
// Не используйте transaction для простых reads
const user = await prisma.user.findUnique({ where: { id: "u1" } });

// Используйте для операций которые должны быть атомарные
const result = await prisma.$transaction(async (tx) => {
  const session = await tx.session.update({ ... });
  const answers = await tx.answer.updateMany({ ... });
  return { session, answers };
});
```

### 3. Оптимизировать queries

```typescript
// Выбирайте нужные поля
select: { id: true, name: true }

// Избегайте N+1 problem
include: { related: true }

// Пагинируйте для больших наборов
skip: (page - 1) * limit,
take: limit
```

### 4. Правильно обрабатывать ошибки

```typescript
try {
  const result = await prisma.$transaction(/* ... */);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Обработать известные ошибки
    if (error.code === 'P2025') {
      return c.json({ error: "Not found" }, 404);
    }
  }
  throw error;
}
```

### 5. Логировать для отладки

```typescript
// Включить логирование queries
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' }
  ]
});
```

---

## Резюме

**Advanced Prisma:**
- Relationships для связей между таблицами
- Transactions для atomic операций
- Performance optimization через select/include
- Batch operations для множественных изменений

**Scoring:**
- Multiple-select: правильные ответы vs неправильные
- Essay: rubric-based scoring преподавателем
- Session management: жизненный цикл квиза

**Admin:**
- CRUD для управления данными
- Оценивание и feedback
- Reporting и статистика

**Optimization:**
- Индексы на часто используемые поля
- Пагинация для больших наборов
- Select/include для быстрых queries
- Transactions для безопасности данных

---

## Архитектура: Services Layer

### Зачем нужен services слой

На LR8 вы создали свой первый backend. Была простая структура: **routes** → **Prisma** → **БД**.

На LR9 логика усложняется. Появляется **бизнес-логика** (scoring algorithm, session management). Если всю эту логику писать в route handlers, они станут очень большими и сложными.

**Пример: Без services (плохо)**

```typescript
// ❌ Вся логика в route handler - 50 строк!
app.post('/api/sessions/:id/submit', async (c) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { answers: true }
  });

  if (!session) {
    return c.json({ error: 'Not found' }, 404);
  }

  if (session.expiresAt < new Date()) {
    return c.json({ error: 'Expired' }, 400);
  }

  // Считаем score
  const score = session.answers
    .filter(a => a.score !== null)
    .reduce((sum, a) => sum + (a.score || 0), 0);

  // Обновляем сессию
  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'completed', score }
  });

  // Может быть письмо студенту
  // await sendEmail(...)

  return c.json({ session: updated });
});
```

**Проблемы:**
- Трудно читать (много кода в одном месте)
- Невозможно протестировать (зависит от HTTP)
- Нельзя переиспользовать (логика привязана к этому route)
- Если логика нужна в другом место — копируем код!

### Решение: Services Layer

Services слой — это класс который содержит бизнес-логику, независимо от HTTP.

**Пример: С services (хорошо)**

```typescript
// src/services/sessionService.ts
export class SessionService {
  async submitSession(sessionId: string) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true }
      });

      // Все проверки и логика в одном месте
      if (!session) {
        throw new Error('Not found');
      }

      if (session.expiresAt < new Date()) {
        throw new Error('Expired');
      }

      const totalScore = this.calculateScore(session.answers);

      return await tx.session.update({
        where: { id: sessionId },
        data: { status: 'completed', score: totalScore }
      });
    });
  }

  private calculateScore(answers: Answer[]): number {
    return answers
      .filter(a => a.score !== null)
      .reduce((sum, a) => sum + (a.score || 0), 0);
  }
}

export const sessionService = new SessionService();
```

```typescript
// src/routes/sessions.ts
app.post('/api/sessions/:id/submit', authMiddleware, async (c) => {
  const { id } = c.req.param();

  try {
    const session = await sessionService.submitSession(id);
    return c.json({ session }); // Просто!
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});
```

**Преимущества:**
- ✅ **Читаемость** — каждый слой делает одно
- ✅ **Тестируемость** — можно тестировать сервис отдельно
- ✅ **Переиспользование** — сервис вызывают из разных routes
- ✅ **Масштабируемость** — легко добавлять новую логику

### Архитектура backend'а

```
HTTP Request
    ↓
  Router (routes/)
    ↓ (парсит request, вызывает сервис)
  Service (services/)
    ↓ (бизнес-логика, транзакции)
  Database (Prisma)
    ↓
Database (SQLite)
```

Каждый слой имеет свою ответственность:

| Слой | Ответственность | Пример |
|------|----------------|--------|
| **routes/** | HTTP (валидация, статусы) | `POST /api/sessions/:id/submit` |
| **services/** | Бизнес-логика | `sessionService.submitSession(id)` |
| **middleware/** | Авторизация | `authMiddleware`, `requireAdmin` |
| **utils/** | Вспомогательные функции | `jwt.ts`, `validation.ts` |
| **db/** | Prisma клиент | `prisma.ts` |

### Когда использовать services

**✅ Нужен service когда:**

1. **Сложная бизнес-логика**
   ```typescript
   // ✅ Scoring algorithm - сложно!
   export class ScoringService {
     scoreMultipleSelect(correctAnswers, studentAnswers) { ... }
     scoreEssay(grades, rubric) { ... }
   }
   ```

2. **Несколько шагов (transaction)**
   ```typescript
   // ✅ Несколько операций = нужен service
   async submitSession(sessionId) {
     return await prisma.$transaction(async (tx) => {
       // шаг 1: получить session
       // шаг 2: проверить expiry
       // шаг 3: считать score
       // шаг 4: обновить session
     });
   }
   ```

3. **Переиспользование в разных routes**
   ```typescript
   // ✅ Scoring нужен в разных местах
   // POST /api/sessions/:id/answers использует scoringService
   // PUT /api/admin/answers/:id/grade использует scoringService
   // GET /api/admin/leaderboard использует scoringService
   ```

4. **Вычисления и трансформации**
   ```typescript
   // ✅ Сложные вычисления
   calculateFinalScore(answers)
   generateReport(sessions)
   validateAnswer(userAnswer, question)
   ```

**❌ Не нужен service когда:**

```typescript
// ❌ Простой CRUD - нет смысла в service
app.get('/api/categories', async (c) => {
  const categories = await prisma.category.findMany();
  return c.json({ categories });
});

// ❌ Просто получить и вернуть
app.get('/api/questions/:id', async (c) => {
  const question = await prisma.question.findUnique({
    where: { id: c.req.param('id') }
  });
  return c.json({ question });
});
```

### Паттерн: Singleton Service

В LR9 используется паттерн **Singleton** — один экземпляр сервиса на всё приложение.

```typescript
// src/services/scoringService.ts
class ScoringService {
  scoreMultipleSelect(correct, student): number { ... }
  scoreEssay(grades, rubric): number { ... }
}

// Экспортируем один экземпляр
export const scoringService = new ScoringService();
```

```typescript
// src/routes/sessions.ts
import { scoringService } from '../services/scoringService';

// Используем везде
const score = scoringService.scoreMultipleSelect(correct, student);
```

**Почему singleton:**
- Просто (один экземпляр)
- Эффективно (нет создания новых объектов)
- Стандартно (общий паттерн)

### Service → Service взаимодействие

Services могут использовать друг друга.

```typescript
// src/services/scoringService.ts
export class ScoringService {
  scoreMultipleSelect(...) { ... }
}

// src/services/sessionService.ts
import { scoringService } from './scoringService';

export class SessionService {
  async submitAnswer(sessionId, questionId, userAnswer) {
    // SessionService использует ScoringService
    const score = scoringService.scoreMultipleSelect(
      correctAnswers,
      userAnswer
    );
    // ...
  }
}
```

Это нормально! Services могут вызывать друг друга, если есть логическая зависимость.

### Миграция с LR8 на LR9

На LR8 вы писали логику в routes:

```typescript
// LR8 (routes/sessions.ts)
app.post('/api/sessions/:id/answers', async (c) => {
  // логика здесь
});
```

На LR9 вы вынимаете логику в services:

```typescript
// LR9 (services/sessionService.ts)
export class SessionService {
  async submitAnswer(sessionId, questionId, userAnswer) {
    // логика здесь
  }
}

// LR9 (routes/sessions.ts)
app.post('/api/sessions/:id/answers', async (c) => {
  const answer = await sessionService.submitAnswer(...);
  return c.json({ answer });
});
```

Это естественная эволюция. Начинаете с простого (LR8), потом организуете код правильно (LR9).
