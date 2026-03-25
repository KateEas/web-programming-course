# HTTP и API Fundamentals - Полное руководство

Подробное руководство по работе с HTTP и API для лабораторной работы с GitHub OAuth.

---

## Содержание

1. [HTTP протокол](#1-http-протокол)
2. [Форматы передачи данных](#2-форматы-передачи-данных)
3. [REST архитектура](#3-rest-архитектура)
4. [Real-time коммуникация](#4-real-time-коммуникация)
5. [Валидация данных](#5-валидация-данных)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Практическое руководство: GitHub OAuth](#7-практическое-руководство-github-oauth)

---

## 1. HTTP протокол

HTTP (HyperText Transfer Protocol) — это протокол передачи данных, на котором построен весь веб.

### 1.1. HTTP методы

HTTP методы определяют, какое действие вы хотите выполнить с ресурсом.

#### GET - Чтение данных

**Характеристики:**
- Идемпотентен: можно вызывать множество раз — результат тот же
- Безопасен: не изменяет данные на сервере
- Кэшируется браузером автоматически
- Данные передаются в URL (query параметры)

**Примеры:**
```typescript
// Получить список пользователей
const response = await fetch('/api/users?page=1&limit=10');
const users = await response.json();

// Получить конкретного пользователя
const user = await fetch('/api/users/123');
const userData = await user.json();
```

**Когда использовать:**
- Получение данных
- Поиск и фильтрация
- Чтение ресурсов

#### POST - Создание ресурса

**Характеристики:**
- НЕ идемпотентен: повторный вызов создаст новый ресурс
- Данные передаются в теле запроса
- Обычно возвращает 201 Created с заголовком Location

**Примеры:**
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  })
});

if (response.status === 201) {
  const newUser = await response.json();
  const location = response.headers.get('Location');
  console.log('Created:', newUser.id, 'at', location);
}
```

**Когда использовать:**
- Создание новых ресурсов
- Отправка форм
- Выполнение действий (отправка email, обработка платежа)

**⚠️ Важно:** Будьте осторожны с повторными POST запросами!

```typescript
// ОПАСНО! Создаст 3 заказа
for (let i = 0; i < 3; i++) {
  await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ product: 'iPhone', price: 999 })
  });
}

// Решение: используйте idempotency key
const idempotencyKey = crypto.randomUUID();
await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify({ product: 'iPhone', price: 999 })
});
```

#### PUT - Полная замена ресурса

**Характеристики:**
- Идемпотентен: можно вызывать множество раз
- Заменяет ресурс ПОЛНОСТЬЮ
- Все поля должны быть указаны

**Примеры:**
```typescript
// Заменяем пользователя полностью
await fetch('/api/users/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    role: 'user'
    // Если не указать какое-то поле, оно станет null!
  })
});
```

**Когда использовать:**
- Полное обновление ресурса
- Когда нужно заменить все данные

#### PATCH - Частичное обновление

**Характеристики:**
- Может быть идемпотентен (зависит от реализации)
- Обновляет только указанные поля
- Остальные поля остаются без изменений

**Примеры:**
```typescript
// Обновляем только возраст
await fetch('/api/users/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 31  // Только этот field изменится
  })
});

// name, email, role остались прежними
```

**Когда использовать:**
- Частичное обновление ресурса
- Изменение отдельных полей
- Большинство случаев обновления

**⚠️ PUT vs PATCH:**
```typescript
// PUT - забыли поле, оно обнулилось
await fetch('/api/users/123', {
  method: 'PUT',
  body: JSON.stringify({ age: 31 })
});
// Result: { age: 31, name: null, email: null } ❌

// PATCH - обновили только age
await fetch('/api/users/123', {
  method: 'PATCH',
  body: JSON.stringify({ age: 31 })
});
// Result: { age: 31, name: 'John', email: 'john@example.com' } ✅
```

#### DELETE - Удаление ресурса

**Характеристики:**
- Идемпотентен: можно удалять несколько раз
- Обычно возвращает 204 No Content (без тела)
- Повторное удаление не ошибка

**Примеры:**
```typescript
const response = await fetch('/api/users/123', {
  method: 'DELETE'
});

if (response.status === 204) {
  console.log('User deleted successfully');
}

// Повторное удаление - не ошибка
await fetch('/api/users/123', { method: 'DELETE' }); // 204 или 404
```

**Когда использовать:**
- Удаление ресурсов
- Отмена операций

### 1.2. HTTP коды ответов

Коды ответов сообщают статус выполнения запроса.

#### 2xx - Успех

- **200 OK** - запрос успешен, есть тело ответа
- **201 Created** - ресурс создан (POST)
- **204 No Content** - успех, но нет тела ответа (DELETE)

```typescript
const response = await fetch('/api/users/123');

if (response.status === 200) {
  const user = await response.json();
  console.log(user);
} else if (response.status === 204) {
  console.log('Success, but no content');
}
```

#### 4xx - Ошибки клиента

Вы сделали что-то не так:

- **400 Bad Request** - некорректный синтаксис (malformed JSON)
- **401 Unauthorized** - требуется аутентификация
- **403 Forbidden** - нет прав доступа
- **404 Not Found** - ресурс не найден
- **422 Unprocessable Entity** - данные не прошли валидацию
- **429 Too Many Requests** - rate limiting

**Критическое различие: 401 vs 403**

```typescript
async function fetchProtectedResource() {
  const response = await fetch('/api/admin/users');

  if (response.status === 401) {
    // "Кто ты?" - не аутентифицирован
    // Токена нет или он истёк
    window.location.href = '/login';
    return;
  }

  if (response.status === 403) {
    // "Знаю кто ты, но нельзя" - недостаточно прав
    // Токен валиден, но у вас роль "user", а нужна "admin"
    showError('Access denied. You need admin privileges.');
    return;
  }

  return await response.json();
}
```

#### 5xx - Ошибки сервера

Сервер сломался:

- **500 Internal Server Error** - общая ошибка сервера
- **502 Bad Gateway** - проблемы с upstream сервером
- **503 Service Unavailable** - сервис временно недоступен

```typescript
if (response.status >= 500) {
  showError('Server error. Please try again later.');

  // Можно реализовать retry логику
  if (retries < 3) {
    await delay(1000);
    return fetchWithRetry(url, retries + 1);
  }
}
```

### 1.3. HTTP заголовки

Заголовки — это метаданные запроса/ответа.

#### Content-Type

Указывает формат данных:

```typescript
// JSON
await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
});

// Форма
await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'name=John&email=john@example.com'
});

// Файлы (НЕ указывайте Content-Type вручную!)
const formData = new FormData();
formData.append('file', file);
await fetch('/api/upload', {
  method: 'POST',
  body: formData  // браузер сам поставит multipart/form-data
});
```

#### Authorization

Передача токенов аутентификации:

```typescript
// Bearer token (JWT)
await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Basic auth (устаревший подход)
const credentials = btoa(`${username}:${password}`);
await fetch('/api/users', {
  headers: {
    'Authorization': `Basic ${credentials}`
  }
});
```

#### Cache-Control

Управление кэшированием:

```typescript
// Не кэшировать
await fetch('/api/profile', {
  headers: {
    'Cache-Control': 'no-cache'
  }
});

// Сервер указывает правила кэширования
// Response headers:
Cache-Control: max-age=3600, private
// → Кэшировать на 1 час, только в браузере

Cache-Control: max-age=86400, public
// → Кэшировать на 24 часа, можно в CDN

Cache-Control: no-store
// → Вообще не кэшировать (для конфиденциальных данных)
```

#### CORS (Cross-Origin Resource Sharing)

Защита от кросс-доменных атак:

```typescript
// Сервер должен вернуть заголовки:
Access-Control-Allow-Origin: https://yourapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true

// Preflight запрос (OPTIONS)
// Браузер автоматически отправляет OPTIONS перед POST/PUT/DELETE
// для проверки разрешений
```

---

## 2. Форматы передачи данных

### 2.1. JSON

JSON — стандарт для современных API.

**Примеры:**

```typescript
// Простой объект
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}

// Вложенные объекты
{
  "user": {
    "id": 123,
    "profile": {
      "name": "John",
      "avatar": "https://..."
    },
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}

// Массивы
{
  "users": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ]
}
```

**TypeScript типизация:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Использование
const response = await fetch('/api/users/123');
const user: User = await response.json();

console.log(user.settings.theme); // TypeScript проверит типы
```

### 2.2. Query параметры

Для фильтрации, сортировки, пагинации.

**Примеры:**

```typescript
// Пагинация
GET /api/users?page=1&limit=10

// Фильтрация
GET /api/users?role=admin&status=active

// Сортировка
GET /api/posts?sort=createdAt&order=desc

// Поиск
GET /api/products?q=laptop&category=electronics&minPrice=500

// Множественные значения
GET /api/products?tags=typescript&tags=react&tags=nodejs
```

**TypeScript helper:**

```typescript
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return; // Пропускаем
    }

    if (Array.isArray(value)) {
      // Массив → множественные значения
      value.forEach(v => query.append(key, String(v)));
    } else {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

// Использование
const params = {
  page: 1,
  limit: 10,
  status: 'active',
  tags: ['typescript', 'react'],
  minPrice: undefined  // Пропустится
};

const queryString = buildQueryString(params);
// → page=1&limit=10&status=active&tags=typescript&tags=react

const response = await fetch(`/api/products?${queryString}`);
```

### 2.3. Path параметры

Идентификация ресурсов в URL.

**Примеры:**

```typescript
// Один ресурс
GET /api/users/123

// Вложенные ресурсы
GET /api/users/123/posts
GET /api/users/123/posts/456
GET /api/users/123/posts/456/comments

// Организационная иерархия
GET /api/organizations/acme/teams/engineering/members
```

**TypeScript типизация путей:**

```typescript
type UserId = string;
type PostId = string;

type ApiPaths = {
  getUser: (userId: UserId) => `/api/users/${string}`;
  getUserPosts: (userId: UserId) => `/api/users/${string}/posts`;
  getPost: (userId: UserId, postId: PostId) => `/api/users/${string}/posts/${string}`;
};

const api: ApiPaths = {
  getUser: (id) => `/api/users/${id}`,
  getUserPosts: (id) => `/api/users/${id}/posts`,
  getPost: (uid, pid) => `/api/users/${uid}/posts/${pid}`
};

// Использование
const userPath = api.getUser('123');  // TypeScript проверит тип
const response = await fetch(userPath);
```

### 2.4. Multipart/form-data

Для загрузки файлов.

**Примеры:**

```typescript
// Загрузка одного файла
async function uploadAvatar(userId: string, file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('userId', userId);

  const response = await fetch('/api/users/avatar', {
    method: 'POST',
    body: formData  // НЕ указывайте Content-Type!
  });

  return await response.json();
}

// Множественные файлы
async function uploadDocuments(files: File[]) {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`document_${index}`, file);
  });

  // Можно добавить метаданные
  formData.append('metadata', JSON.stringify({
    folder: 'documents',
    tags: ['important']
  }));

  return await fetch('/api/upload/documents', {
    method: 'POST',
    body: formData
  });
}

// React пример с input
function FileUploadComponent() {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  };

  return <input type="file" multiple onChange={handleUpload} />;
}
```

---

## 3. REST архитектура

REST (Representational State Transfer) — архитектурный стиль для проектирования API.

### 3.1. Принципы REST

1. **Stateless** - каждый запрос содержит всю необходимую информацию
2. **Resource-based** - ресурсы идентифицируются URL
3. **HTTP методы** - используем семантику HTTP
4. **Стандартные форматы** - JSON, XML

### 3.2. CRUD → HTTP маппинг

Стандартный набор операций для любого ресурса:

| CRUD | HTTP | Endpoint | Request Body | Response | Status |
|------|------|----------|--------------|----------|--------|
| Create | POST | `/users` | `{ name, email }` | Created user | 201 |
| Read | GET | `/users` | - | Array of users | 200 |
| Read | GET | `/users/123` | - | Single user | 200 |
| Update | PUT | `/users/123` | `{ name, email, age }` | Updated user | 200 |
| Update | PATCH | `/users/123` | `{ age }` | Updated user | 200 |
| Delete | DELETE | `/users/123` | - | - | 204 |

**Пример TypeScript класса:**

```typescript
class UsersAPI {
  private baseUrl = '/api/users';

  // CREATE
  async create(data: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.status !== 201) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  }

  // READ (list)
  async list(params?: ListParams): Promise<User[]> {
    const query = buildQueryString(params || {});
    const response = await fetch(`${this.baseUrl}?${query}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  }

  // READ (single)
  async get(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (response.status === 404) {
      throw new Error('User not found');
    }

    if (response.status !== 200) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  }

  // UPDATE
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.status !== 200) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });

    if (response.status !== 204) {
      throw new Error('Failed to delete user');
    }
  }
}

// Использование
const usersAPI = new UsersAPI();

const newUser = await usersAPI.create({ name: 'John', email: 'john@example.com' });
const users = await usersAPI.list({ page: 1, limit: 10 });
const user = await usersAPI.get('123');
await usersAPI.update('123', { age: 30 });
await usersAPI.delete('123');
```

### 3.3. Best Practices именования

✅ **Хорошо:**
- Множественное число: `/users`, `/posts`
- Lowercase: `/api/users`
- Дефисы: `/user-profiles`
- Без глаголов: `GET /users` (не `/getUsers`)
- Вложенность: `/users/123/posts`

❌ **Плохо:**
- Единственное число: `/user`
- camelCase: `/userProfiles`
- snake_case: `/user_profiles`
- Глаголы в URL: `/getUsers`, `/createUser`
- Некорректная вложенность: `/getUserPosts?userId=123`

---

## 4. Real-time коммуникация

Когда нужны обновления в реальном времени.

### 4.1. WebSockets

Двусторонняя связь client ↔ server.

**Примеры:**

```typescript
const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  console.log('Connected');

  // Отправка сообщения на сервер
  socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'notifications'
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  // Обработка разных типов сообщений
  switch (data.type) {
    case 'notification':
      showNotification(data.payload);
      break;
    case 'message':
      displayMessage(data.payload);
      break;
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('Disconnected');
  // Переподключение через 5 секунд
  setTimeout(() => {
    connectWebSocket();
  }, 5000);
};
```

**Use cases:**
- Чаты
- Онлайн игры
- Collaborative editing (Google Docs)
- Real-time dashboards

### 4.2. Server-Sent Events (SSE)

Односторонняя связь server → client.

**Примеры:**

```typescript
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
};

// Слушать конкретные типы событий
eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  showNotification(notification);
});

eventSource.addEventListener('update', (event) => {
  const update = JSON.parse(event.data);
  updateUI(update);
});

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

**Use cases:**
- Push-уведомления
- Live feeds (новости)
- Progress updates
- Биржевые котировки

---

## 5. Валидация данных

### 5.1. Клиент vs Сервер

**ПРАВИЛО: ВСЕГДА делать обе валидации!**

**Клиентская (UX):**
```typescript
// Мгновенный feedback
function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }

  return null;
}

// В React форме
const [emailError, setEmailError] = useState<string | null>(null);

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const email = e.target.value;
  setEmailError(validateEmail(email));
};

<input type="email" onChange={handleEmailChange} />
{emailError && <span className="error">{emailError}</span>}
```

**Серверная (Безопасность):**
```typescript
// На сервере повторяем ВСЕ проверки + дополнительные
async function validateUserServer(data: CreateUserRequest): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Структурная валидация
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  // Бизнес-правила
  if (data.age < 18) {
    errors.push({ field: 'age', message: 'Must be at least 18' });
  }

  // Референциальная валидация (ТОЛЬКО на сервере!)
  const emailExists = await db.users.exists({ email: data.email });
  if (emailExists) {
    errors.push({ field: 'email', message: 'Email already taken' });
  }

  if (data.referrerId) {
    const referrerExists = await db.users.exists({ id: data.referrerId });
    if (!referrerExists) {
      errors.push({ field: 'referrerId', message: 'Referrer not found' });
    }
  }

  return errors;
}

// В Express endpoint
app.post('/api/users', async (req, res) => {
  const errors = await validateUserServer(req.body);

  if (errors.length > 0) {
    return res.status(422).json({
      type: 'validation-error',
      title: 'Validation Failed',
      status: 422,
      errors
    });
  }

  // Создаём пользователя
  const user = await db.users.create(req.body);
  res.status(201).json(user);
});
```

### 5.2. HTTP 422 и структура ошибок

**RFC 7807 (Problem Details):**

```typescript
interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: ValidationError[];
}

// Обработка на клиенте
async function handleSubmit(data: FormData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (response.status === 422) {
    const problem: ApiProblemDetails = await response.json();

    // Показываем ошибки под полями формы
    problem.errors?.forEach(error => {
      showFieldError(error.field, error.message);
    });

    return;
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const user = await response.json();
  console.log('User created:', user);
}
```

---

## 6. Authentication & Authorization

### 6.1. AAA

- **Authentication** - "Кто ты?" (проверка личности)
- **Authorization** - "Что можно?" (проверка прав)
- **Accounting** - "Что делал?" (логирование)

```typescript
// 1. Authentication
const user = await authenticateUser(email, password);
// Result: { id: 123, email: 'john@example.com', roles: ['user'] }

// 2. Authorization
if (!user.roles.includes('admin')) {
  throw new Error('Forbidden: Admin access required');
}

// 3. Accounting
await db.auditLog.create({
  userId: user.id,
  action: 'delete_user',
  resource: '/api/users/456',
  timestamp: new Date()
});
```

### 6.2. JWT (JSON Web Token)

**Структура:** `header.payload.signature`

```typescript
import jwt from 'jsonwebtoken';

// Генерация токена
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    roles: user.roles
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h'
  }
);

// Проверка токена
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// → { userId: 123, email: '...', roles: [...], exp: 1234567890 }

// ⚠️ ВАЖНО: Payload можно декодировать БЕЗ секрета!
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload); // Виден всем!

// Поэтому НЕ храните пароли или секретные данные в JWT
```

**Использование на клиенте:**

```typescript
// Хранение токена
localStorage.setItem('token', token);

// Отправка с каждым запросом
const response = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Обработка истечения токена
if (response.status === 401) {
  // Токен истёк или невалиден
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 6.3. Refresh Tokens

Решение проблемы коротко живущих токенов.

**Концепция:**
- Access token: короткий (15 мин) - для обычных запросов
- Refresh token: длинный (7 дней) - для получения нового access token

**Реализация:**

```typescript
// Login: выдаём оба токена
app.post('/api/auth/login', async (req, res) => {
  const user = await authenticateUser(req.body.email, req.body.password);

  const accessToken = jwt.sign(
    { userId: user.id },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  // Сохраняем refresh token в БД
  await db.refreshTokens.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json({ accessToken, refreshToken, user });
});

// Refresh: получаем новый access token
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Check not revoked
  const exists = await db.refreshTokens.findOne({
    userId: decoded.userId,
    token: refreshToken
  });

  if (!exists) {
    return res.status(401).json({ error: 'Refresh token revoked' });
  }

  // Generate new access token
  const newAccessToken = jwt.sign(
    { userId: decoded.userId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken: newAccessToken });
});

// Logout: revoke refresh token
app.post('/api/auth/logout', async (req, res) => {
  const { refreshToken } = req.body;
  await db.refreshTokens.delete({ token: refreshToken });
  res.json({ success: true });
});
```

**Клиент с автоматическим refresh:**

```typescript
class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async request(url: string, options: RequestInit = {}) {
    // Add access token
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`
    };

    let response = await fetch(url, { ...options, headers });

    // If 401, try to refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed - redirect to login
        window.location.href = '/login';
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        this.accessToken = accessToken;
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
    }

    return false;
  }
}
```

---

## 7. Практическое руководство: GitHub OAuth

### 7.1. Регистрация GitHub OAuth App

1. Перейдите на https://github.com/settings/developers
2. "New OAuth App"
3. Заполните:
   - Application name: "My App"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/callback`
4. Сохраните `Client ID` и сгенерируйте `Client Secret`

⚠️ **Client Secret** храните на backend! Никогда не коммитьте в Git!

### 7.2. Authorization Code Flow

**Шаг 1: Redirect на GitHub**

```typescript
function loginWithGitHub() {
  const params = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'user:email read:user',  // Запрашиваемые разрешения
    state: generateRandomState()     // CSRF protection
  });

  // Сохраняем state в localStorage для проверки
  localStorage.setItem('github_oauth_state', params.get('state')!);

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}
```

**Шаг 2: Обработка callback**

```typescript
async function handleGitHubCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // Verify state (CSRF protection)
  const savedState = localStorage.getItem('github_oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }

  if (!code) {
    throw new Error('No code received from GitHub');
  }

  // Exchange code for token (на ВАШЕМ backend!)
  const response = await fetch('/api/auth/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const { token, user } = await response.json();

  // Сохраняем токен
  localStorage.setItem('token', token);

  // Redirect на главную
  window.location.href = '/';
}
```

**Шаг 3: Backend exchange**

```typescript
app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,  // Только на backend!
      code
    })
  });

  const { access_token, error } = await tokenResponse.json();

  if (error) {
    return res.status(400).json({ error });
  }

  // Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json'
    }
  });

  const githubUser = await userResponse.json();

  // Create or update user in your database
  const user = await db.users.upsert({
    githubId: githubUser.id,
    email: githubUser.email,
    name: githubUser.name,
    avatar: githubUser.avatar_url,
    accessToken: access_token  // Храним для API запросов
  });

  // Generate YOUR JWT
  const jwt = generateJWT(user);

  res.json({ token: jwt, user });
});
```

**Шаг 4: Использование GitHub API**

```typescript
async function fetchGitHubRepos() {
  const user = await db.users.findById(currentUserId);

  const response = await fetch('https://api.github.com/user/repos', {
    headers: {
      'Authorization': `Bearer ${user.accessToken}`,
      'Accept': 'application/vnd.github+json'
    }
  });

  // Обработка rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
  }

  // Pagination через Link header
  const linkHeader = response.headers.get('Link');
  // Link: <https://api.github.com/user/repos?page=2>; rel="next"

  const repos = await response.json();
  return repos;
}
```

### 7.3. Best Practices

1. **Никогда не храните Client Secret на клиенте**
2. **Используйте state parameter для CSRF protection**
3. **Обрабатывайте rate limiting (HTTP 429)**
4. **Храните GitHub access token в БД для API запросов**
5. **Используйте свой JWT для аутентификации в вашем приложении**
6. **Обрабатывайте истечение GitHub токенов**

---

## Полезные ссылки

- [MDN: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [JWT.io](https://jwt.io/)
- [RFC 7807: Problem Details](https://tools.ietf.org/html/rfc7807)
- [REST API Tutorial](https://restfulapi.net/)
