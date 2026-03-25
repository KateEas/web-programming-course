# HTTP и API Fundamentals - Cheatsheet

Быстрая справка по основам HTTP и API для лабораторных работ.

---

## HTTP Методы

| Метод | Назначение | Идемпотентен | Пример |
|-------|-----------|--------------|--------|
| `GET` | Чтение данных | ✅ Да | `GET /api/users/123` |
| `POST` | Создание ресурса | ❌ Нет | `POST /api/users` |
| `PUT` | Полная замена | ✅ Да | `PUT /api/users/123` |
| `PATCH` | Частичное обновление | ⚠️ Зависит | `PATCH /api/users/123` |
| `DELETE` | Удаление | ✅ Да | `DELETE /api/users/123` |

```typescript
// GET
const response = await fetch('/api/users/123');
const user = await response.json();

// POST
await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
});

// PATCH
await fetch('/api/users/123', {
  method: 'PATCH',
  body: JSON.stringify({ age: 30 })
});

// DELETE
await fetch('/api/users/123', { method: 'DELETE' });
```

---

## HTTP Коды Ответов

### 2xx - Успех
- `200 OK` - успешный запрос с данными
- `201 Created` - ресурс создан
- `204 No Content` - успех без тела

### 4xx - Ошибки клиента
- `400 Bad Request` - некорректный синтаксис
- `401 Unauthorized` - требуется аутентификация → redirect на login
- `403 Forbidden` - нет прав доступа → показать ошибку
- `404 Not Found` - ресурс не найден
- `422 Unprocessable Entity` - ошибки валидации
- `429 Too Many Requests` - rate limiting

### 5xx - Ошибки сервера
- `500 Internal Server Error` - ошибка на сервере
- `502 Bad Gateway` - проблемы с прокси
- `503 Service Unavailable` - сервис недоступен

```typescript
if (response.status === 401) {
  window.location.href = '/login'; // Не авторизован
}

if (response.status === 403) {
  showError('Access denied'); // Нет прав
}

if (response.status === 422) {
  const error = await response.json();
  error.errors?.forEach(err => {
    showFieldError(err.field, err.message);
  });
}
```

---

## HTTP Заголовки

### Основные заголовки запроса
```typescript
await fetch('/api/users', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
});
```

### Cache-Control
- `max-age=3600` - кэш на 1 час
- `no-cache` - проверять актуальность
- `no-store` - не кэшировать
- `private` - только браузер
- `public` - CDN и прокси

### CORS
```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Форматы Данных

### JSON
```typescript
// Отправка
await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John', age: 30 })
});

// Получение
const data = await response.json();
```

### Query Parameters
```typescript
// Примеры URL
GET /api/users?page=1&limit=10
GET /api/users?role=admin&status=active
GET /api/posts?sort=createdAt&order=desc

// Построение query string
function buildQuery(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => query.append(key, v));
    } else if (value !== undefined) {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

const qs = buildQuery({ page: 1, tags: ['ts', 'react'] });
// → page=1&tags=ts&tags=react
```

### Path Parameters
```typescript
GET /api/users/123              // Один ресурс
GET /api/users/123/posts        // Вложенные ресурсы
GET /api/users/123/posts/456    // Глубокая вложенность
```

### Multipart (файлы)
```typescript
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', '123');

  await fetch('/api/upload', {
    method: 'POST',
    body: formData  // Content-Type автоматически
  });
}
```

---

## REST Best Practices

### CRUD Mapping
| CRUD | HTTP | Endpoint | Ответ |
|------|------|----------|-------|
| Create | `POST` | `/users` | 201 Created |
| Read | `GET` | `/users` | 200 OK (список) |
| Read | `GET` | `/users/123` | 200 OK (один) |
| Update | `PATCH` | `/users/123` | 200 OK |
| Delete | `DELETE` | `/users/123` | 204 No Content |

### Правила Именования

✅ **Хорошо:**
```
GET    /api/users
POST   /api/users
GET    /api/users/123
PATCH  /api/users/123
DELETE /api/users/123
GET    /api/users/123/posts
GET    /api/user-profiles
```

❌ **Плохо:**
```
GET    /api/getUsers          // Глагол в URL
POST   /api/createUser        // Глагол в URL
GET    /api/user/123          // Единственное число
GET    /api/userProfiles      // camelCase
GET    /api/user_profiles     // snake_case
```

**Правила:**
- Множественное число для коллекций
- Lowercase URL
- Дефисы для разделения слов
- Без глаголов (глагол = HTTP метод)

---

## Real-time Коммуникация

### WebSockets (двусторонняя связь)
```typescript
const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'subscribe', channel: 'notifications' }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

socket.onclose = () => console.log('Disconnected');
```

**Use cases:** чаты, онлайн игры, collaborative editing

### Server-Sent Events (только server → client)
```typescript
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

**Use cases:** уведомления, live feeds, progress updates

---

## Валидация

### Клиент vs Сервер

**Клиентская (UX):**
```typescript
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}
```

**Серверная (Безопасность):**
```typescript
async function validateUser(data: CreateUserRequest): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Структурная
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email' });
  }

  // Бизнес-правила
  if (data.age < 18) {
    errors.push({ field: 'age', message: 'Must be at least 18' });
  }

  // Референциальная (только на сервере!)
  const emailExists = await db.users.exists({ email: data.email });
  if (emailExists) {
    errors.push({ field: 'email', message: 'Email already taken' });
  }

  return errors;
}
```

### HTTP 422 - Структура ошибок
```json
{
  "type": "validation-error",
  "title": "Validation Failed",
  "status": 422,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Must be at least 18"
    }
  ]
}
```

---

## Authentication & Authorization

### AAA
- **Authentication** - "Кто ты?" (логин/пароль, OAuth)
- **Authorization** - "Что можно?" (роли, permissions)
- **Accounting** - "Что делал?" (логирование)

### JWT (JSON Web Token)

**Структура:** `header.payload.signature`

```typescript
// Генерация
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, roles: user.roles },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Проверка
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// → { userId: 123, roles: ['admin'], exp: ... }

// Использование
await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**⚠️ Важно:** Payload можно декодировать без секрета! Не храните пароли в JWT.

### OAuth 2.0 (GitHub)

**Authorization Code Flow:**

```typescript
// 1. Redirect to GitHub
function loginWithGitHub() {
  const params = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'user:email'
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

// 2. Handle callback
async function handleCallback() {
  const code = new URLSearchParams(window.location.search).get('code');

  // 3. Exchange code for token (на вашем backend!)
  const response = await fetch('/api/auth/github', {
    method: 'POST',
    body: JSON.stringify({ code })
  });

  const { token } = await response.json();
  localStorage.setItem('token', token);
}

// 4. Backend exchange
app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const { access_token } = await tokenResponse.json();

  // 5. Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  const user = await userResponse.json();
  res.json({ token: generateJWT(user) });
});
```

### Refresh Tokens

```typescript
// Login: выдать оба токена
const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

// Refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // Verify
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

  // Check not revoked
  const exists = await db.refreshTokens.findOne({ token: refreshToken });
  if (!exists) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  // Generate new access token
  const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET, { expiresIn: '15m' });

  res.json({ accessToken: newAccessToken });
});
```

---

## Типичные Ошибки

### ❌ Повторение POST запросов
```typescript
// ОПАСНО!
for (let i = 0; i < 3; i++) {
  await fetch('/api/orders', { method: 'POST', ... }); // 3 заказа!
}
```

### ❌ PUT вместо PATCH
```typescript
// Забыли указать все поля - они станут null!
await fetch('/api/users/123', {
  method: 'PUT',
  body: JSON.stringify({ age: 31 }) // name и email потерялись!
});

// ✅ Используйте PATCH для частичного обновления
await fetch('/api/users/123', {
  method: 'PATCH',
  body: JSON.stringify({ age: 31 }) // OK
});
```

### ❌ Только клиентская валидация
```typescript
// Легко обойти через DevTools!
if (validateEmail(email)) {
  await fetch('/api/users', { method: 'POST', ... });
}

// ✅ Обязательно валидация на сервере
app.post('/api/users', async (req, res) => {
  const errors = await validateUser(req.body);
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }
  // ...
});
```

### ❌ Client secret в браузере
```typescript
// НИКОГДА!
const token = await fetch('https://github.com/login/oauth/access_token', {
  body: JSON.stringify({
    client_secret: 'YOUR_SECRET' // УТЕЧКА!
  })
});

// ✅ Только на backend
app.post('/api/auth/github', async (req, res) => {
  const tokenResponse = await fetch('...', {
    body: JSON.stringify({
      client_secret: process.env.GITHUB_CLIENT_SECRET // Безопасно
    })
  });
});
```

### ❌ Пароли в JWT
```typescript
// НИКОГДА!
const token = jwt.sign({ userId, password: user.password }, SECRET);

// ✅ Только non-sensitive данные
const token = jwt.sign({ userId, email, roles }, SECRET);
```

---

## Полезные Ссылки

- [MDN: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [RFC 7231: HTTP/1.1 Semantics](https://tools.ietf.org/html/rfc7231)
- [RFC 7807: Problem Details](https://tools.ietf.org/html/rfc7807)
- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [JWT.io](https://jwt.io/) - декодирование JWT
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [REST API Tutorial](https://restfulapi.net/)
