# LR9: Database & Business Logic
## Справочник (Cheatsheet)

Быстрые ссылки на синтаксис и примеры кода.

---

## Project Architecture

### Folder Structure

```
quiz-backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/               # HTTP handlers
│   │   ├── auth.ts
│   │   ├── sessions.ts
│   │   └── admin.ts
│   ├── services/             # Business logic (singleton instances)
│   │   ├── index.ts          # Service registry - инициализация
│   │   ├── scoringService.ts
│   │   └── sessionService.ts
│   ├── middleware/           # JWT, validation, error handling
│   │   └── auth.ts
│   ├── utils/                # Helpers, validation schemas
│   │   └── validation.ts
│   └── db/
│       └── client.ts         # PrismaClient singleton
├── prisma/
│   ├── schema.prisma         # Database models
│   └── migrations/           # Database version control
├── .env                      # Environment variables (не коммитить!)
├── package.json
└── tsconfig.json
```

### Service Registry (центральная инициализация)

```typescript
// src/services/index.ts
import { PrismaClient } from '@prisma/client';
import { ScoringService } from './scoringService';
import { SessionService } from './sessionService';

// Singleton instances - один экземпляр на всё приложение
export const prisma = new PrismaClient();

export const scoringService = new ScoringService();
export const sessionService = new SessionService(prisma, scoringService);

// Экспортируем как namespace для удобства
export const services = {
  scoring: scoringService,
  session: sessionService
};
```

### Routes импортируют готовые сервисы

```typescript
// src/routes/sessions.ts
import { Hono } from 'hono';
import { sessionService } from '../services';
import { AnswerSchema } from '../utils/validation';

const app = new Hono();

app.post('/api/sessions/:id/answers', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const data = AnswerSchema.parse(body);

    // Route просто вызывает метод сервиса
    const answer = await sessionService.submitAnswer(
      id,
      data.questionId,
      data.userAnswer
    );

    return c.json({ answer }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});
```

### Service Implementation

```typescript
// src/services/sessionService.ts
import { PrismaClient } from '@prisma/client';
import { ScoringService } from './scoringService';

export class SessionService {
  constructor(
    private prisma: PrismaClient,
    private scoringService: ScoringService
  ) {}

  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string | string[]
  ) {
    // Вся бизнес-логика здесь
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) throw new Error('Question not found');

    let score: number | null = null;
    if (question.type === 'multiple-select') {
      score = this.scoringService.scoreMultipleSelect(
        question.correctAnswers,
        userAnswer as string[]
      );
    }

    return await this.prisma.answer.create({
      data: {
        sessionId,
        questionId,
        userAnswer: JSON.stringify(userAnswer),
        score
      }
    });
  }
}
```

### Testing без HTTP (Unit Testing)

```typescript
// tests/services/scoringService.test.ts
import { ScoringService } from '../../src/services/scoringService';

const service = new ScoringService();

// Тестируем scoring логику без HTTP запросов
describe('ScoringService', () => {
  test('scoreMultipleSelect - правильные ответы', () => {
    const score = service.scoreMultipleSelect(
      ['A', 'C', 'D'],      // correct
      ['A', 'C']            // student
    );
    expect(score).toBe(2);  // 2 правильных
  });

  test('scoreMultipleSelect - смешанные ответы', () => {
    const score = service.scoreMultipleSelect(
      ['A', 'C', 'D'],      // correct
      ['A', 'B', 'C']       // student: A✓, B✗, C✓
    );
    expect(score).toBe(1.5); // 2 правильных - 0.5 за неправильный
  });

  test('scoreMultipleSelect - минимум 0', () => {
    const score = service.scoreMultipleSelect(
      ['A', 'C'],
      ['B', 'D', 'E']       // всё неправильно
    );
    expect(score).toBe(0);  // Math.max(negative, 0)
  });
});
```

---

## Prisma Relationships

### One-to-Many

```prisma
// Schema
model User {
  id       String
  sessions Session[]
}

model Session {
  id     String
  userId String
  user   User @relation(fields: [userId], references: [id])
}
```

```typescript
// Query
const user = await prisma.user.findUnique({
  where: { id: "u1" },
  include: { sessions: true }
});

// Delete cascade
model User {
  sessions Session[] @relation(onDelete: Cascade)
}
```

### Many-to-Many

```prisma
// Schema
model Question {
  id   String
  tags Tag[]
}

model Tag {
  id        String
  questions Question[]
}
```

```typescript
// Query
const q = await prisma.question.findUnique({
  where: { id: "q1" },
  include: { tags: true }
});

// Create with relations
const q = await prisma.question.create({
  data: {
    text: "...",
    tags: {
      connect: [{ id: "tag1" }, { id: "tag2" }]
    }
  }
});

// Update relations
await prisma.question.update({
  where: { id: "q1" },
  data: {
    tags: {
      disconnect: [{ id: "tag1" }],
      connect: [{ id: "tag3" }]
    }
  }
});
```

---

## Transactions

```typescript
// Basic
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: "u1" } });
  const session = await tx.session.create({ data: { userId: user.id } });
  return { user, session };
});

// Batch transaction
const results = await prisma.$transaction([
  prisma.user.create({ data: { ... } }),
  prisma.session.create({ data: { ... } })
]);

// Rollback на ошибку
try {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ ... });
    throw new Error("Something failed"); // Откатит всё
  });
} catch (e) {
  // Ничего не изменилось
}
```

---

## Performance

### Select (выбрать поля)

```typescript
// ❌ Все поля
await prisma.session.findMany();

// ✅ Только нужные
await prisma.session.findMany({
  select: {
    id: true,
    score: true,
    user: {
      select: { name: true }
    }
  }
});
```

### Include (загрузить связи)

```typescript
// ❌ N+1 problem
const sessions = await prisma.session.findMany();
for (const s of sessions) {
  const user = await prisma.user.findUnique({
    where: { id: s.userId }
  });
}

// ✅ Один query
const sessions = await prisma.session.findMany({
  include: { user: true }
});
```

### Pagination

```typescript
const limit = 20;
const page = 1;

const items = await prisma.model.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});

const total = await prisma.model.count();
const pages = Math.ceil(total / limit);
```

### Batch Operations

```typescript
// Create many
await prisma.question.createMany({
  data: [
    { text: "Q1", type: "multiple-select" },
    { text: "Q2", type: "essay" }
  ],
  skipDuplicates: true
});

// Update many
await prisma.answer.updateMany({
  where: { sessionId: "s1" },
  data: { status: "graded" }
});

// Delete many
await prisma.answer.deleteMany({
  where: { score: null }
});
```

---

## Scoring Functions

### Multiple-Select

```typescript
function scoreMultipleSelect(
  correctAnswers: string[],
  studentAnswers: string[]
): number {
  let score = 0;

  for (const answer of studentAnswers) {
    if (correctAnswers.includes(answer)) {
      score += 1; // правильный
    } else {
      score -= 0.5; // неправильный
    }
  }

  return Math.max(0, score); // минимум 0
}

// Пример
const score = scoreMultipleSelect(
  ["A", "C", "D"],
  ["A", "B", "C"]
); // 1.5
```

### Multiple-Select Normalized

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

  const normalized = (rawScore / correctAnswers.length) * maxPoints;
  return Math.max(0, Math.min(maxPoints, normalized));
}
```

### Essay (from rubric)

```typescript
interface Grade {
  criterion: string;
  points: number;
}

interface RubricCriterion {
  name: string;
  maxPoints: number;
}

function scoreEssay(
  grades: Grade[],
  rubric: RubricCriterion[]
): number {
  let total = 0;

  for (const grade of grades) {
    const criterion = rubric.find(r => r.name === grade.criterion);
    if (!criterion) continue;

    const capped = Math.min(grade.points, criterion.maxPoints);
    total += capped;
  }

  return total;
}
```

---

## Services Layer

### Scoring Service

```typescript
// src/services/scoringService.ts
export class ScoringService {
  scoreMultipleSelect(
    correctAnswers: string[],
    studentAnswers: string[]
  ): number {
    let score = 0;
    for (const answer of studentAnswers) {
      score += correctAnswers.includes(answer) ? 1 : -0.5;
    }
    return Math.max(0, score);
  }

  scoreEssay(
    grades: { criterion: string; points: number }[],
    rubric: { criterion: string; maxPoints: number }[]
  ): number {
    let total = 0;
    for (const grade of grades) {
      const criterion = rubric.find(r => r.criterion === grade.criterion);
      if (!criterion) continue;
      total += Math.min(grade.points, criterion.maxPoints);
    }
    return total;
  }
}

export const scoringService = new ScoringService();
```

### Session Service

```typescript
// src/services/sessionService.ts
import { prisma } from '../db/client';
import { scoringService } from './scoringService';

export class SessionService {
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string | string[]
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) throw new Error('Question not found');

    let score: number | null = null;

    if (question.type === 'multiple-select') {
      score = scoringService.scoreMultipleSelect(
        question.correctAnswers,
        userAnswer as string[]
      );
    }

    return await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        userAnswer: JSON.stringify(userAnswer),
        score
      }
    });
  }

  async submitSession(sessionId: string) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true }
      });

      if (!session) throw new Error('Session not found');
      if (session.expiresAt < new Date()) throw new Error('Expired');

      const totalScore = session.answers
        .filter(a => a.score !== null)
        .reduce((sum, a) => sum + (a.score || 0), 0);

      return await tx.session.update({
        where: { id: sessionId },
        data: { status: 'completed', score: totalScore }
      });
    });
  }
}

export const sessionService = new SessionService();
```

### Usage in Routes

```typescript
// src/routes/sessions.ts
import { sessionService } from '../services/sessionService';
import { AnswerSchema } from '../utils/validation';

app.post('/api/sessions/:id/answers', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const data = AnswerSchema.parse(body);
    const answer = await sessionService.submitAnswer(
      id,
      data.questionId,
      data.userAnswer
    );
    return c.json({ answer }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.post('/api/sessions/:id/submit', authMiddleware, async (c) => {
  const { id } = c.req.param();

  try {
    const session = await sessionService.submitSession(id);
    return c.json({ session });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});
```

---

## Session Management

```typescript
// Start session
const session = await prisma.session.create({
  data: {
    userId: "u1",
    status: "in_progress",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  }
});

// Submit answer
const answer = await prisma.answer.create({
  data: {
    sessionId: "s1",
    questionId: "q1",
    userAnswer: JSON.stringify(["A", "C"]),
    score: questionType === "multiple-select" ? calculatedScore : null
  }
});

// Submit session
const completed = await prisma.$transaction(async (tx) => {
  const session = await tx.session.findUnique({
    where: { id: "s1" },
    include: { answers: true }
  });

  if (session.expiresAt < new Date()) {
    throw new Error("Expired");
  }

  const score = session.answers
    .filter(a => a.score !== null)
    .reduce((sum, a) => sum + (a.score || 0), 0);

  return await tx.session.update({
    where: { id: "s1" },
    data: { status: "completed", score }
  });
});

// Get session with answers
const full = await prisma.session.findUnique({
  where: { id: "s1" },
  include: {
    answers: {
      include: { question: true }
    }
  }
});
```

---

## Validation with Zod

```typescript
import { z } from 'zod';

// Answer validation
const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  userAnswer: z.union([
    z.array(z.string()),  // multiple-select
    z.string()             // essay
  ]),
  sessionId: z.string().uuid()
});

// Scoring rules validation
const ScoringRulesSchema = z.object({
  pointsPerCorrect: z.number().min(0).max(10),
  pointsPerIncorrect: z.number().min(-5).max(0),
  minScore: z.number().min(0),
  maxScore: z.number().positive()
});

// Grade validation (for essay)
const GradeSchema = z.object({
  criterion: z.string(),
  points: z.number().min(0).max(10),
  feedback: z.string().optional()
});

// Usage
const parsed = AnswerSchema.safeParse(body);
if (!parsed.success) {
  return c.json({ error: parsed.error.flatten() }, 400);
}
const validData = parsed.data;
```

---

## Admin Endpoints

### Create Question

```typescript
app.post('/api/admin/questions', requireAdmin, async (c) => {
  const body = await c.req.json();

  const question = await prisma.question.create({
    data: {
      text: body.text,
      type: body.type, // "multiple-select", "essay"
      options: body.options, // для multiple-select
      correctAnswers: body.correctAnswers,
      rubric: body.rubric // для essay
    }
  });

  return c.json({ question }, 201);
});
```

### Get All Questions

```typescript
app.get('/api/admin/questions', requireAdmin, async (c) => {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      type: true,
      createdAt: true,
      _count: { select: { answers: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return c.json({ questions });
});
```

### Get Pending Grading

```typescript
app.get('/api/admin/grading/pending', requireAdmin, async (c) => {
  const answers = await prisma.answer.findMany({
    where: {
      score: null,
      question: { type: "essay" }
    },
    include: {
      question: true,
      session: {
        include: { user: { select: { name: true, email: true } } }
      }
    },
    orderBy: { createdAt: 'asc' },
    take: 10
  });

  return c.json({ answers });
});
```

### Submit Grade

```typescript
app.post('/api/admin/answers/:id/grade', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const { score, feedback } = await c.req.json();

  const updated = await prisma.$transaction(async (tx) => {
    const answer = await tx.answer.update({
      where: { id },
      data: { score, feedback }
    });

    const session = await tx.session.findUnique({
      where: { id: answer.sessionId },
      include: { answers: true }
    });

    const allGraded = session.answers.every(a => a.score !== null);
    if (allGraded) {
      const totalScore = session.answers.reduce(
        (sum, a) => sum + (a.score || 0),
        0
      );
      await tx.session.update({
        where: { id: answer.sessionId },
        data: { score: totalScore, status: "completed" }
      });
    }

    return answer;
  });

  return c.json({ answer: updated });
});
```

### Student Statistics

```typescript
app.get('/api/admin/students/:userId/stats', requireAdmin, async (c) => {
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

  const avgScore = sessions.length
    ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
    : 0;

  return c.json({
    userId,
    totalSessions: sessions.length,
    averageScore: Math.round(avgScore),
    sessions
  });
});
```

---

## Database Indexes

```prisma
model Session {
  id        String  @id @default(cuid())
  userId    String
  status    String
  createdAt DateTime @default(now())

  // Single field indexes
  @@index([userId])
  @@index([status])

  // Composite index
  @@index([userId, status])
}

model Answer {
  id        String @id @default(cuid())
  sessionId String
  score     Int?

  // Multiple indexes for different queries
  @@index([sessionId])
  @@index([sessionId, score(sort: Desc)])
}
```

---

## Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({
    data: { email: "test@test.com" }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint failed
      return c.json({ error: "Email already exists" }, 400);
    }
    if (error.code === 'P2025') {
      // Record not found
      return c.json({ error: "Not found" }, 404);
    }
  }
  throw error;
}
```

---

## Common Patterns

### Check Authorization

```typescript
async function requireSessionOwner(
  sessionId: string,
  userId: string
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Not authorized");
  }

  return session;
}

// Usage
const session = await requireSessionOwner(sessionId, userId);
```

### Calculate Progress

```typescript
async function getSessionProgress(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      _count: { select: { answers: true } }
    }
  });

  const totalQuestions = session.totalQuestions;
  const answered = session._count.answers;
  const progress = Math.round((answered / totalQuestions) * 100);

  return { answered, totalQuestions, progress };
}
```

### Get Leaderboard

```typescript
app.get('/api/admin/leaderboard', requireAdmin, async (c) => {
  const results = await prisma.session.groupBy({
    by: ['userId'],
    _avg: { score: true },
    _max: { score: true },
    _count: { id: true },
    orderBy: {
      _avg: { score: 'desc' }
    },
    take: 10
  });

  // Добавить имена студентов
  const withNames = await Promise.all(
    results.map(async (r) => {
      const user = await prisma.user.findUnique({
        where: { id: r.userId },
        select: { name: true }
      });
      return { ...r, userName: user?.name };
    })
  );

  return c.json({ results: withNames });
});
```

---

## Useful SQL Queries via Prisma

```typescript
// Raw SQL if needed
const results = await prisma.$queryRaw`
  SELECT u.name, AVG(s.score) as avg_score
  FROM users u
  LEFT JOIN sessions s ON u.id = s."userId"
  GROUP BY u.id
  ORDER BY avg_score DESC
`;
```

---

## Environment Variables

```env
# .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

```typescript
// Usage
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET not set");
}
```
