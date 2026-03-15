# Quiz Mock Server

Mock API сервер для тестирования квиз-приложения.

## Установка

```bash
cd mock-server
npm install
```

## Запуск

```bash
# Обычный запуск
npm start

# Запуск с автоперезагрузкой (nodemon)
npm run dev
```

Сервер запустится на `http://localhost:3000`

## Быстрый старт

### 1. Получите токен авторизации

```bash
curl http://localhost:3000/api/auth/github/callback?code=mock_code
```

Ответ:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_student1",
    "username": "student1",
    "role": "student"
  }
}
```

### 2. Используйте токен в запросах

```bash
export TOKEN="your_token_here"

# Получить текущего пользователя
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# Получить категории
curl http://localhost:3000/api/categories

# Получить вопросы (только в Game Mode)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/questions

# Создать сессию
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryIds": ["cat_react"], "difficulty": "medium", "questionCount": 3}' \
  http://localhost:3000/api/sessions

# Отправить ответ
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questionId": "q_001", "selectedOptions": [1, 2]}' \
  http://localhost:3000/api/sessions/sess_xxx/answers
```

## Тестовые пользователи

### Студент
- **Username:** student1
- **ID:** usr_student1
- **Role:** student
- Получите токен через `/api/auth/github/callback?code=mock_code`

### Админ
Для получения админского токена измените код в `server.js`:
```javascript
// В /api/auth/github/callback
const user = db.get('users').find({ role: 'admin' }).value();
```

## Данные

### Категории (3 шт.)
- React Hooks (cat_react) - 5 вопросов
- TypeScript (cat_typescript) - 3 вопроса
- Работа с API (cat_api) - 4 вопроса

### Вопросы (6 шт.)

#### Multiple-select вопросы:
1. **q_001**: Хуки для side effects (medium, 4 балла)
2. **q_002**: HTTP методы (easy, 5 баллов)
3. **q_004**: Типы данных в TypeScript (easy, 6 баллов)
4. **q_005**: Возможности React Query (medium, 5 баллов)

#### Essay вопросы:
1. **q_003**: Разница между useMemo и useCallback (hard, 5 баллов)
2. **q_006**: Жизненный цикл компонента (hard, 8 баллов)

## Примеры запросов

### Получить режим работы

```bash
curl http://localhost:3000/api/mode
```

Ответ:
```json
{
  "mode": "game",
  "battleConfig": null
}
```

### Изменить режим на Battle (только админ)

```bash
curl -X PUT \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "battle",
    "battleConfig": {
      "questionCount": 20,
      "timeLimit": 90,
      "allowedAttempts": 1,
      "randomOrder": true,
      "showResultsImmediately": false
    }
  }' \
  http://localhost:3000/api/mode
```

### Создать сессию

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryIds": ["cat_react", "cat_api"],
    "difficulty": "medium",
    "questionCount": 5
  }' \
  http://localhost:3000/api/sessions
```

Ответ включает sessionId и список вопросов (БЕЗ правильных ответов):
```json
{
  "sessionId": "sess_1234567890",
  "userId": "usr_student1",
  "status": "active",
  "mode": "game",
  "questions": [
    {
      "id": "q_001",
      "type": "multiple-select",
      "question": "Какие хуки используются для side effects в React?",
      "difficulty": "medium",
      "maxPoints": 4,
      "options": ["useState", "useEffect", "useLayoutEffect", "useMemo"]
    }
  ],
  "totalQuestions": 5,
  "answeredCount": 0,
  "maxScore": 20,
  "currentScore": 0
}
```

### Отправить ответ на multiple-select вопрос

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q_001",
    "selectedOptions": [1, 2]
  }' \
  http://localhost:3000/api/sessions/sess_1234567890/answers
```

Ответ с автоматической проверкой:
```json
{
  "answerId": "ans_1234567890",
  "questionId": "q_001",
  "status": "correct",
  "pointsEarned": 4,
  "maxPoints": 4,
  "feedback": "Вы набрали 4 из 4 баллов.",
  "correctOptions": [1, 2],
  "breakdown": {
    "correctSelected": 2,
    "incorrectSelected": 0,
    "pointsFromCorrect": 4,
    "penaltyFromIncorrect": 0,
    "totalBeforeMin": 4
  }
}
```

### Отправить ответ на essay вопрос

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q_003",
    "text": "useMemo используется для мемоизации вычисленных значений, а useCallback для мемоизации функций..."
  }' \
  http://localhost:3000/api/sessions/sess_1234567890/answers
```

Ответ (202 - ожидает проверки):
```json
{
  "answerId": "ans_1234567891",
  "questionId": "q_003",
  "status": "pending",
  "message": "Ответ сохранен и ожидает проверки преподавателем"
}
```

### Завершить сессию

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/sessions/sess_1234567890/submit
```

### Получить результаты сессии

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/sessions/sess_1234567890/results
```

Ответ:
```json
{
  "sessionId": "sess_1234567890",
  "userId": "usr_student1",
  "status": "partial",
  "mode": "game",
  "totalQuestions": 3,
  "answeredQuestions": 3,
  "score": {
    "earned": 9,
    "max": 15,
    "percentage": 60.0
  },
  "answers": [
    {
      "answerId": "ans_001",
      "questionId": "q_001",
      "question": { ... },
      "status": "correct",
      "pointsEarned": 4,
      "maxPoints": 4,
      "userAnswer": [1, 2],
      "correctOptions": [1, 2]
    },
    {
      "answerId": "ans_002",
      "questionId": "q_003",
      "question": { ... },
      "status": "pending",
      "pointsEarned": 0,
      "maxPoints": 5,
      "userAnswer": "useMemo используется для..."
    }
  ],
  "completedAt": "2025-01-15T11:30:00Z",
  "timeSpent": 1800
}
```

### Админские функции

#### Получить все вопросы с правильными ответами

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/questions
```

#### Создать вопрос

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "multiple-select",
    "question": "Какие хуки есть в React?",
    "difficulty": "easy",
    "categoryId": "cat_react",
    "options": [
      {"text": "useState", "points": 1, "isCorrect": true},
      {"text": "useEffect", "points": 1, "isCorrect": true},
      {"text": "useHook", "points": 0, "isCorrect": false}
    ],
    "penaltyPerWrong": -1,
    "minScore": 0
  }' \
  http://localhost:3000/api/admin/questions
```

#### Настроить сложность для студента

```bash
curl -X PUT \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "hard",
    "questionCount": 20,
    "categoryIds": ["cat_react", "cat_typescript"]
  }' \
  http://localhost:3000/api/admin/users/usr_student1/difficulty
```

#### Оценить essay-ответ

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rubricScores": [
      {"criterion": "Понимание useMemo", "earnedPoints": 2},
      {"criterion": "Понимание useCallback", "earnedPoints": 1.5},
      {"criterion": "Примеры использования", "earnedPoints": 0.5}
    ],
    "generalFeedback": "Хорошее объяснение, но примеры могли быть более подробными"
  }' \
  http://localhost:3000/api/admin/answers/ans_1234567891/grade
```

## Логика подсчета баллов (multiple-select)

Формула:
```
pointsFromCorrect = сумма баллов за правильно выбранные варианты
penalty = количество неправильно выбранных * penaltyPerWrong
totalBeforeMin = pointsFromCorrect + penalty
finalScore = max(totalBeforeMin, minScore)
```

### Пример 1: Все правильно
- Вопрос: 2 правильных варианта (по 2 балла), штраф -1
- Ответ: [1, 2] (оба правильные)
- Результат: 2 + 2 = **4 балла** ✅

### Пример 2: Частично правильно
- Вопрос: 2 правильных варианта (по 2 балла), 2 неправильных, штраф -1
- Ответ: [1, 2, 3] (два правильных, один неправильный)
- Результат: 2 + 2 - 1 = **3 балла** ⚠️

### Пример 3: Больше неправильных, чем правильных
- Вопрос: 2 правильных (по 2 балла), штраф -1, minScore = 0
- Ответ: [1, 3, 4] (один правильный, два неправильных)
- Результат: 2 - 2 = 0, но minScore = 0 → **0 баллов** ❌

## Режимы работы

### Game Mode
- Студенты могут просматривать вопросы (`GET /api/questions`)
- Могут выбирать категории и сложность
- Неограниченное количество попыток
- Нет ограничения по времени

### Battle Mode
- Вопросы скрыты (`GET /api/questions` → 403)
- Параметры сессии задаются админом для каждого студента
- Ограничение по времени (90 минут по умолчанию)
- Одна попытка

## Структура данных

Все данные хранятся в `db.json`:
- `users` - пользователи (студенты и админы)
- `userDifficultySettings` - индивидуальные настройки сложности
- `mode` - текущий режим работы системы
- `categories` - категории/темы вопросов
- `questions` - вопросы с правильными ответами
- `sessions` - игровые сессии
- `answers` - ответы студентов

## Возможные ошибки

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```
Решение: добавьте `Authorization: Bearer <token>` заголовок

### 403 Forbidden (в Battle Mode)
```json
{
  "error": "Forbidden",
  "message": "Questions are hidden in Battle Mode. Create a session to start."
}
```
Решение: создайте сессию вместо прямого запроса вопросов

### 403 Forbidden (не админ)
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```
Решение: используйте админский токен

## Отладка

Сервер логирует все запросы в консоль. Смотрите вывод для отладки.

## Сброс данных

Чтобы сбросить базу данных к начальному состоянию:
1. Остановите сервер
2. Отредактируйте `db.json`
3. Перезапустите сервер

Или используйте Git:
```bash
git checkout mock-server/db.json
```
