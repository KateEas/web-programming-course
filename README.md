# Программа курса "Веб-программирование с TypeScript и React"

## Общая информация

**Продолжительность:** 10 занятий (включая ознакомительное)
**Формат:** 9 лекций (90 мин) + 9 лабораторных работ (180 мин) + 1 ознакомительное занятие
**Целевая аудитория:** Студенты с поверхностным знанием HTML, CSS, JavaScript и React

> **Примечание для текущего семестра:** Занятия 8-9 (React Native и Production Deployment) переносятся на следующий семестр. В этом семестре завершаем на занятии 7.

## Технологический стек

**Frontend (LR1-7):**

- TypeScript, React, Vite, Tailwind CSS
- Управление состоянием: MobX, Zustand
- Тестирование: Vitest, React Testing Library, Playwright

**Backend (LR8-10):**

- Node.js + Hono (TypeScript-first framework)
- Prisma ORM + SQLite (или PostgreSQL в production)
- Zod для валидации + JWT для аутентификации
- REST API + OpenAPI/Swagger спецификации

**DevOps & Deployment (LR11-13):**

- Docker для контейнеризации
- GitHub Actions для CI/CD
- PWA (Service Workers, Web App Manifest)
- Deployment: Vercel/Netlify (frontend) + Railway/Render (backend)

**Инструменты:** ESLint, Prettier, Git, Postman/Insomnia

---

## Занятие 0

### Ознакомительное занятие

**Цели:**

- Онбординг студентов
- Знакомство с процессом работы (fork → pull request)
- Диагностика текущих знаний

**Содержание:**

- Введение в курс и методологию работы
- Диагностическая лабораторная работа (HTML, CSS, JavaScript)
- Настройка рабочего окружения (Git, IDE)

---

## Занятие 1: Основы TypeScript

### Лекция: Введение в TypeScript

**Темы:**

- Мотивация перехода с JavaScript на TypeScript
- Система типов: примитивы, объекты, массивы
- Union и intersection типы
- Интерфейсы и типы (type vs interface)
- Generics для начинающих
- Настройка tsconfig.json
- Работа с внешними библиотеками (@types)

### Лабораторная работа: Практика TypeScript

**Задачи:**

- Рефакторинг существующего JavaScript кода в TypeScript
- Создание типизированных функций и объектов
- Работа с массивами и объектами сложной структуры
- Создание интерфейсов для API responses
- Практика с generics
- Решение типовых проблем типизации

---

## Занятие 2: React + TypeScript

### Лекция: React с типизацией

**Темы:**

- **Быстрое освежение React:** компоненты, props, state, хуки
- **Типизация React компонентов:**
  - Функциональные компоненты с TypeScript
  - Типизация props (включая children и callback props)
  - Типизация состояния (useState, useReducer)
  - Event handlers в TypeScript
  - Типизация useEffect и кастомных хуков
  - Работа с ref'ами

### Лабораторная работа: Практика React + TypeScript

**Задачи:**

- Создание сложных типизированных компонентов
- Передача данных между компонентами с типизацией
- Работа с формами и валидацией
- Условный рендеринг и списки
- Композиция компонентов
- Создание переиспользуемых типизированных компонентов

---

## Занятие 3: Современный стек разработки

### Лекция: Vite + Tailwind CSS

**Темы:**

- Сравнение Vite с Create React App
- Настройка проекта: Vite + React + TypeScript
- Конфигурация Vite (vite.config.ts)
- Введение в Tailwind CSS
- Utility-first подход к стилизации
- Интеграция Tailwind с Vite
- Hot Module Replacement (HMR) и dev experience
- Настройка ESLint + Prettier для TypeScript

### Лабораторная работа: Освоение стека

**Задачи:**

- Инициализация нескольких проектов с нуля
- Настройка полного dev окружения
- Создание компонентной библиотеки с Tailwind
- Responsive дизайн и мобильная адаптация
- Настройка линтинга и форматирования
- Оптимизация dev experience

---

## Занятие 4: Управление состоянием - MobX + Zustand

### Лекция: Современный state management

**MobX:**

- Концепции: Observable, Action, Computed
- Создание stores с TypeScript
- Интеграция с React (observer HOC/hook)
- Архитектурные паттерны с MobX
- Best practices и распространенные ошибки

**Zustand:**

- Минималистичный API
- TypeScript типизация store'ов
- Создание простых глобальных store'ов
- Middleware и persistence

**Комбинирование:**

- Когда использовать MobX vs Zustand
- Паттерны совместного использования
- Архитектурные решения

### Лабораторная работа: Комплексное приложение с состоянием

**Задачи:**

- Создание MobX stores для бизнес-логики
- Zustand для UI состояния и пользовательских настроек
- API интеграция с обработкой ошибок
- Полная типизация всех store'ов
- Реализация оптимистичных обновлений
- Практика с различными сценариями состояния
- Отладка и профилирование состояния

---

## Занятие 5: HTTP и API Fundamentals

### Лекция: Глубокое погружение в работу с API

**Часть 1: HTTP протокол**

- **HTTP методы детально:**
  - GET (идемпотентность, кэширование)
  - POST vs PUT vs PATCH (семантика, idempotency)
  - DELETE
  - OPTIONS, HEAD (preflight, metadata)
- **Коды ответов по категориям:**
  - 2xx: успех (200, 201, 204)
  - 3xx: редиректы (301, 302, 304)
  - 4xx: клиентские ошибки (400, 401, 403, 404, 422, 429)
  - 5xx: серверные ошибки (500, 502, 503)
- **Headers:** Content-Type, Authorization, Cache-Control, CORS

**Часть 2: Форматы передачи данных**

- **JSON:** стандарт для современных API
- **Query params:** фильтрация, сортировка, пагинация
- **URL/Path params:** REST ресурсы
- **Request body:** JSON vs FormData
- **Multipart/form-data:** загрузка файлов
- **XML:** legacy APIs (краткий обзор)
- **gRPC + Protocol Buffers:** обзор (когда нужна производительность)

**Часть 3: REST архитектура**

- Принципы REST
- **CRUD → HTTP методы маппинг:**
  - Create → POST /resources
  - Read → GET /resources/:id
  - Update → PUT/PATCH /resources/:id
  - Delete → DELETE /resources/:id
- Именование endpoints (множественное число, вложенность)
- Stateless коммуникация

**Часть 4: Real-time и альтернативы**

- **WebSockets:** двусторонняя связь
- **Server-Sent Events (SSE):** уведомления от сервера
- **Long polling:** историческая справка
- **HTTP/2 и gRPC:** мультиплексирование, streaming

**Часть 5: Валидация данных**

- **Клиентская vs серверная валидация:**
  - Почему нужны обе
  - UX vs безопасность
- **Валидация на уровне API:**
  - HTTP 422 Unprocessable Entity
  - Структура ошибок валидации в responses
  - Стандарты описания ошибок (RFC 7807, JSON:API)
- **Типы валидации:**
  - Структурная (типы данных, обязательные поля)
  - Бизнес-правила (ограничения, форматы)
  - Референциальная (внешние ключи, связи)

**Часть 6: AAA - Authentication, Authorization, Accounting**

- **Различие понятий:**
  - Authentication (кто ты?)
  - Authorization (что тебе можно?)
  - Accounting (что ты делал?)
- **Механизмы аутентификации:**
  - Session-based (cookies)
  - Token-based (JWT)
  - OAuth 2.0 flows
- **GitHub OAuth детально (для лабы):**
  - Authorization Code flow
  - Redirect URI
  - Access tokens и scopes
- **JWT структура:** header.payload.signature
- **Bearer tokens** в заголовках
- **Refresh tokens** и их ротация

### Лабораторная работа: GitHub OAuth интеграция

**Задачи:**

- Регистрация GitHub OAuth App
- Реализация Authorization Code flow
- Обработка callback и получение access token
- Работа с GitHub API (получение профиля пользователя)
- Хранение токенов (localStorage vs memory, безопасность)
- Protected routes на основе авторизации
- Обработка различных HTTP статусов (401, 403, 422, 429)
- **Валидация ответов от API** (проверка структуры данных)
- Pagination через GitHub API (query params, Link headers)
- Error handling для auth flow с детальными сообщениями валидации
- Refresh token flow (опционально)

> **Примечание:** В следующих семестрах рекомендуется проводить это занятие ПЕРЕД занятием 6, так как оно закладывает фундаментальные знания для работы с react-query и OpenAPI.

---

## Занятие 6: Продвинутые React паттерны + API

### Лекция: Advanced React + работа с данными

**Темы:**

- Кастомные хуки с TypeScript
- Error Boundaries и обработка ошибок
- React.memo, useMemo, useCallback для оптимизации
- Suspense и concurrent features
- Паттерны работы с API (fetch, axios)
- **Валидация на клиенте:**
  - Библиотеки валидации (Zod, Yup, io-ts)
  - React Hook Form + схемы валидации
  - Реактивная валидация и UX
  - TypeScript типы из схем валидации
- **React Query:** декларативная работа с данными
- **OpenAPI/Swagger:** типобезопасная генерация клиентов + схемы валидации
- Композиция компонентов и render props
- Контекст и провайдеры

### Лабораторная работа: Архитектура и API интеграция

**Задачи:**

- Рефакторинг приложения под производительность
- Создание переиспользуемых архитектурных решений
- **Валидация форм:**
  - Интеграция Zod/Yup с React Hook Form
  - Создание переиспользуемых схем валидации
  - Валидация API responses с типобезопасностью
  - Отображение ошибок валидации в UI
- Сложные API интеграции с различными endpoints
- Интеграция React Query для кэширования
- Генерация API клиента из OpenAPI спецификации (с автоматическими схемами валидации)
- Кэширование данных и синхронизация
- Профилирование и оптимизация React приложения
- Создание системы компонентов

---

## Занятие 7: Testing - Vitest & Playwright

### Лекция: Автоматическое тестирование React приложений

**Часть 1: Введение в тестирование**

- Зачем нужно тестирование (уверенность, документация, экономия времени)
- Тестовая пирамида: Unit (60-70%), Integration (20-30%), E2E (5-10%)
- **Jest vs Vitest:**
  - Jest - индустриальный стандарт (70% проектов)
  - Vitest - современная альтернатива (в 2-10 раз быстрее)
  - API на 95% совместим - знание переносится
  - Vitest для курса: нативная интеграция с Vite, лучший DX

**Часть 2: Vitest - Unit & Component тесты**

- Setup Vitest + React Testing Library
- Структура теста: AAA pattern (Arrange, Act, Assert)
- Matchers (assertions): toBe, toEqual, toContain, toThrow
- **Моки (Mocking):**
  - Mock функций: `vi.fn()` (в Jest: `jest.fn()`)
  - Mock модулей: `vi.mock()`
  - Spy на методы: `vi.spyOn()`
- **React Testing Library:**
  - Философия: тестируем как пользователь
  - Queries приоритеты: getByRole → getByLabelText → getByText → getByTestId
  - User Events: `userEvent.click()`, `userEvent.type()`
  - Async testing: `findBy*`, `waitFor()`
- **Jest-DOM matchers:** toBeInTheDocument, toBeVisible, toBeDisabled
- Тестирование MobX stores

**Часть 3: Playwright - E2E тестирование**

- Что такое E2E и когда использовать
- Setup Playwright (автозапуск dev-сервера)
- Написание E2E теста (полный user flow)
- Локаторы: getByRole, getByText, CSS selectors
- Actions: click, fill, type, select
- Assertions: toBeVisible, toHaveText, toHaveValue
- UI Mode для debugging

**Часть 4: Best Practices**

- Тестируйте поведение, не implementation details
- Один тест = одна проверка
- Не мокайте всё подряд
- Используйте правильные селекторы (getByRole)
- Coverage ≠ качество (70-80% достаточно)

### Лабораторная работа: Тестирование Quiz приложения

**Задачи:**

**Часть 1: Setup**

- Установка Vitest, RTL, Playwright
- Конфигурация vitest.config.ts и playwright.config.ts
- Создание setup файлов

**Часть 2: Рефакторинг на компоненты**

- Декомпозиция Task4.tsx на переиспользуемые компоненты:
  - QuizButton - переиспользуемая кнопка
  - MultipleSelectQuestion - вопросы с выбором
  - EssayQuestion - текстовые вопросы
  - QuizProgress - индикатор прогресса

**Часть 3: Unit тесты**

- Тесты для utils (calculateScore, getCorrectAnswersCount)
- Тесты для gameStore (toggleAnswer, nextQuestion, computed properties)
- ≥10 unit тестов

**Часть 4: Component тесты**

- Тесты для QuizButton (render, onClick, disabled)
- Тесты для EssayQuestion (textarea, character count, onChange)
- Тесты для MultipleSelectQuestion (options, selection, toggle)
- ≥3 компонента покрыты тестами

**Часть 5: E2E тесты (30 мин, опционально)**

- E2E тест: прохождение квиза
- E2E тест: разные типы вопросов
- Проверка полного user flow

---

## Занятие 8: Backend API with Hono + TypeScript

### Лекция: От потребления API к созданию API (90 мин)

**Часть 1: Architektura Fullstack приложения**

- Как взаимодействуют Frontend и Backend
- Зачем нужен Backend (хранение данных, бизнес-логика, безопасность)
- REST API концепция (endpoints, методы, статусы)
- Fullstack архитектура: Frontend → Backend → Database

**Часть 2: Hono Framework**

- Почему Hono (TypeScript-first, быстро, минимальный setup)
- Сравнение с Express, Fastify, Next.js
- Основные концепции: routes, handlers, middleware
- Типизация с TypeScript

**Часть 3: Prisma ORM**

- Что такое ORM и когда нужна
- Prisma Schema и models
- Type-safe запросы к БД (типизация автоматическая)
- Миграции и синхронизация БД

**Часть 4: Валидация и безопасность**

- Zod для runtime валидации
- JWT аутентификация (tokens, refresh, revocation)
- Middleware для проверки авторизации
- Обработка ошибок (правильные HTTP коды)

**Часть 5: OpenAPI спецификация**

- Стандарт описания REST API (контракт между frontend и backend)
- Как backend реализует endpoints согласно схеме
- Автоматическая генерация типов для frontend

**Этап 1: Настройка cross-platform проекта**

- Создание React Native проекта с ReactStrict-DOM
- Настройка TypeScript конфигурации для mobile
- Интеграция существующих компонентов и stores (MobX/Zustand)
- Настройка hot reload для мобильной разработки
- Первый запуск на эмуляторе Android/iOS

**Этап 2: Адаптация под мобильные**

- Рефакторинг веб-компонентов для ReactStrict-DOM
- Создание мобильной навигации (стеки, табы, модалы)
- Адаптация форм под touch-интерфейсы
- Responsive компоненты с учетом размеров экрана
- Обработка состояний клавиатуры и orientation

**Этап 3: Нативные возможности**

- Интеграция с нативными API через ReactStrict-DOM
- Работа с камерой и галереей фотографий
- Push-уведомления и background tasks
- Offline functionality и синхронизация данных
- Тестирование на реальных устройствах

**Этап 1: Setup (30 мин)**

- Инициализация Node.js проекта с TypeScript
- Установка Hono, Prisma, Zod, JWT
- Конфигурация окружения

**Этап 2: Настройка БД (30 мин)**

- Prisma schema для Quiz приложения
- Models: User, Category, Question, Session, Answer
- Миграция БД (SQLite для разработки)
- Prisma Studio для просмотра данных

**Этап 3: Реализация Endpoints (90 мин)**

- Auth endpoints (POST /api/auth/github/callback, GET /api/auth/me)
- Categories endpoints (GET, POST)
- Questions endpoints (GET)
- Sessions endpoints (POST, GET, POST /answers)
- Валидация с Zod + обработка ошибок

**Этап 4: Интеграция с Frontend (30 мин)**

- Замена mock API на реальный backend
- Тестирование endpoints через curl/Postman
- Проверка что React приложение работает с backend

---

## Занятие 9: Database & Business Logic - Scoring Algorithm

### Лекция: Advanced Backend - База данных и бизнес-логика (90 мин)

**Часть 1: Advanced Prisma**

- Relationships: one-to-many, many-to-many
- Transactions (атомарные операции)
- Batch operations (createMany, updateMany)
- Performance: select (выбираем только нужные поля), include (связи)

**Часть 2: Scoring Algorithm**

- Multiple-select вопросы: правильные ответы, штрафы, баллы
- Essay вопросы: rubric-based scoring, отзывы
- Session management: completion, expiration, results
- Admin endpoints для проверки и оценивания

**Часть 3: Валидация на сервере**

- Валидация на входе (Zod schemas)
- Бизнес-правила валидации
- Обработка edge cases

**Часть 4: Database в production**

- Миграции в production (как безопасно обновлять schema)
- Backup и recovery
- Performance optimization (индексы, query планы)

### Лабораторная работа: Scoring Logic & Database Optimization (180 мин)

**Этап 1: Реализация Scoring Algorithm (60 мин)**

- Функции для подсчёта баллов за разные типы вопросов
- Integration в Session endpoints
- Проверка корректности scoring на разных сценариях

**Этап 2: Advanced Database (60 мин)**

- Оптимизация queries (select вместо findMany())
- Транзакции для критичных операций
- Добавление indексов для часто используемых полей

**Этап 3: Integration Testing (30 мин)**

- Тестирование scoring через API
- Проверка edge cases (пустые ответы, time limits)
- Testing admin endpoints для оценивания

**Этап 4: Admin Features (30 мин)**

- Admin endpoints для управления вопросами
- Оценивание essay ответов
- Reporting и статистика

---

## Занятие 10: Backend Testing & Validation

### Лекция: Тестирование Backend приложений (90 мин)

**Часть 1: Unit Testing Backend**

- Тестирование функций (scoring, calculations)
- Моки для Prisma (mocking БД)
- Тестирование validation schema (Zod)

**Часть 2: Integration Testing**

- Тестирование endpoints (request/response)
- Использование test client для Hono
- Fixtures и seed данные для тестов

**Часть 3: API Testing**

- Инструменты: Postman, Insomnia, curl
- Создание collections для testing
- Автоматизация API тестов

**Часть 4: Security Testing**

- Testing authentication (JWT tokens)
- Authorization (доступ к ресурсам)
- Input validation (防SQL injection)

### Лабораторная работа: Полное тестирование Backend (180 мин)

**Этап 1: Unit Tests (60 мин)**

- Тесты для scoring функций
- Тесты для Zod validation
- ≥10 unit тестов

**Этап 2: Integration Tests (60 мин)**

- Тесты для auth endpoints
- Тесты для session flow
- ≥5 integration тестов

**Этап 3: Manual API Testing (30 мин)**

- Создание Postman collection
- Тестирование всех endpoints
- Проверка error handling

**Этап 4: Test Coverage (30 мин)**

- Достичь ≥70% code coverage
- Идентификация untested code

---

## Занятие 11: DevOps - Docker & CI/CD

### Лекция: Контейнеризация и автоматизация (90 мин)

**Часть 1: Docker Basics**

- Что такое Docker и почему нужен (окружение, портативность)
- Docker images vs containers
- Dockerfile: инструкции, best practices
- Docker Compose для multi-container приложений

**Часть 2: Containerizing Backend**

- Dockerfile для Node.js приложения
- Оптимизация image size (multi-stage builds)
- Environment variables и secrets
- Volume mounting для development

**Часть 3: CI/CD с GitHub Actions**

- Что такое CI/CD (автоматизация testing и deployment)
- GitHub Actions workflow
- Triggers (push, pull request, schedule)
- Jobs и steps

**Часть 4: Deployment**

- Deployment platforms (Railway, Render, Heroku)
- Database hosting (Neon, Supabase)
- Environment configuration
- Monitoring logs и errors

### Лабораторная работа: Полный DevOps Setup (180 мин)

**Этап 1: Docker Setup (60 мин)**

- Создание Dockerfile для backend
- Docker Compose для backend + database
- Testing локально в container

**Этап 2: GitHub Actions (60 мин)**

- Создание workflow для CI (запуск тестов)
- Автоматический build и push образа
- Deployment на staging окружение

**Этап 3: Production Deployment (30 мин)**

- Deploy на Railway/Render
- Настройка database в production
- Testing production окружения

**Этап 4: Monitoring (30 мин)**

- Настройка логирования
- Error tracking (Sentry)
- Performance monitoring

---

## Занятие 12: PWA & Offline-first

### Лекция: Progressive Web Apps (90 мин)

**Часть 1: PWA концепция**

- Что такое PWA (progressive, web, app)
- Преимущества PWA vs native apps
- PWA критерии (installable, fast, reliable)

**Часть 2: Service Workers**

- Что такое Service Worker (worker process для offline)
- Registration и lifecycle
- Fetch interception (кэширование)
- Background sync

**Часть 3: Offline Strategy**

- Cache-first vs network-first vs stale-while-revalidate
- Offline data storage (IndexedDB, localStorage)
- Синхронизация данных при возврате online

**Часть 4: Web App Manifest & Installation**

- Web App Manifest (metadata для installable app)
- Install prompt (как предложить install)
- App icons и splash screens

### Лабораторная работа: PWA Implementation (180 мин)

**Этап 1: Service Worker Setup (60 мин)**

- Регистрация Service Worker
- Fetch interception и caching
- Offline fallback page

**Этап 2: Offline Support (60 мин)**

- Сохранение ответов пользователя (IndexedDB)
- Синхронизация при reconnect
- Обработка конфликтов данных

**Этап 3: Installation (30 мин)**

- Web App Manifest
- Install prompt
- App icons

**Этап 4: Testing (30 мин)**

- Testing offline mode
- Chrome DevTools для PWA
- Testing на мобильном

---

## Занятие 13: Fullstack Завершение & Best Practices

### Лекция: Production-Ready приложение (90 мин)

**Часть 1: Security**

- HTTPS и TLS
- CORS правильно
- Rate limiting
- Input sanitization

**Часть 2: Performance**

- Frontend: Code splitting, lazy loading, image optimization
- Backend: Database indexing, query optimization, caching
- Network: CDN для статических файлов

**Часть 3: Scaling**

- Горизонтальное масштабирование
- Load balancing
- Database replication
- Caching layer (Redis)

**Часть 4: Deployment Strategy**

- Blue-green deployment
- Canary releases
- Rollback стратегии
- Monitoring и alerting

### Лабораторная работа: Полное production-ready приложение (180 мин)

**Этап 1: Оптимизация (60 мин)**

- Bundle analysis и optimization (frontend)
- Database query optimization (backend)
- Performance тестирование

**Этап 2: Security Audit (30 мин)**

- OWASP top 10 проверка
- Dependency vulnerability scanning
- Security headers настройка

**Этап 3: Full Deployment (60 мин)**

- Deploy frontend на Vercel/Netlify
- Deploy backend на Railway/Render
- Настройка custom domain
- SSL certificates

**Этап 4: Monitoring & Documentation (30 мин)**

- Настройка Sentry для monitoring
- API documentation (OpenAPI/Swagger UI)
- README и deployment guide
- Architecture documentation

---

## Финальный проект: Full-Stack Quiz Application

К концу курса студенты создают полноценное fullstack веб-приложение - Quiz платформу с поддержкой работы offline.

### Архитектура проекта:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (LR1-7, 12)                     │
│  React + TypeScript + Vite + Tailwind + MobX + Zustand     │
│                   Service Worker (PWA)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (LR8-11)                           │
│    Node.js + Hono + TypeScript + Prisma + Zod + JWT         │
│              Docker + GitHub Actions CI/CD                   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE (LR9, 11)                         │
│                SQLite (dev) → PostgreSQL (prod)              │
└─────────────────────────────────────────────────────────────┘
```

### Технические требования:

**Frontend (LR1-7, 12):**

- TypeScript + React + Vite + Tailwind CSS
- MobX (бизнес-логика) + Zustand (UI состояние)
- React Query для синхронизации с backend
- Vitest (unit/component) + Playwright (E2E тесты)
- Service Worker для offline support (PWA)
- Test coverage ≥70%

**Backend (LR8-11):**

- Node.js + Hono (TypeScript-first framework)
- Prisma ORM + Zod validation
- JWT аутентификация + middleware
- RESTful API согласно OpenAPI спецификации
- Scoring algorithm для оценивания ответов
- Unit + Integration тесты (≥70% coverage)
- Docker контейнеризация
- GitHub Actions CI/CD pipeline

**DevOps & Deployment (LR11, 13):**

- Docker для контейнеризации
- GitHub Actions для автоматического тестирования и deployment
- Deployment: Vercel/Netlify (frontend) + Railway/Render (backend)
- Database: PostgreSQL в production
- Monitoring: Sentry для error tracking
- Performance: Lighthouse score ≥90

**Quality Metrics:**

- Frontend: Test coverage ≥70%, Lighthouse ≥90
- Backend: Test coverage ≥70%, API dokumentation (OpenAPI)
- Security: HTTPS, JWT tokens, CORS, input validation
- Performance: API response time <200ms, Frontend load <2s

### Функциональные возможности:

**Аутентификация:**

- GitHub OAuth интеграция
- JWT tokens с refresh механизмом
- Role-based access control (student, admin)

**Quiz функциональность:**

- Создание квизов с разными типами вопросов
  - Multiple-select (с штрафами за неправильные)
  - Essay (с проверкой преподавателем)
- Session management (start, pause, submit)
- Real-time scoring и feedback
- Прогресс бар и таймер
- History и результаты прошлых попыток

**Admin функциональность:**

- Создание и управление вопросами
- Проверка essay ответов
- Просмотр статистики студентов
- Экспорт результатов

**Offline функциональность (PWA):**

- Работа без интернета (Service Worker)
- Сохранение ответов в IndexedDB
- Синхронизация при восстановлении соединения
- Installable как мобильное приложение

**Качество кода:**

- Типобезопасный код везде (Frontend + Backend)
- Обработка ошибок и graceful degradation
- Loading states и skeleton screens
- Доступность (a11y) - ARIA labels, keyboard navigation
- Responsive дизайн (мобильные устройства)
- Pagination и infinite scroll
- Кэширование данных (React Query + Service Worker)

### Deployment & Monitoring:

- CI/CD pipeline на каждый push
- Автоматические тесты перед deployment
- Production deployment с zero downtime
- Error tracking и monitoring (Sentry)
- Performance tracking (Web Vitals)
- API documentation (Swagger UI)

---

## Методология работы

### Процесс выполнения лабораторных работ:

1. Форк репозитория курса
2. Выполнение задания (в классе или дома)
3. Отправка Pull Request для проверки

### Материалы для подготовки:

- Конспекты в директориях `lr*/docs/`
- Интерактивные руководства
- Примеры кода

---

## Ожидаемые результаты

По завершении курса студенты будут уметь:

### Frontend разработка (LR1-7, 12):

- ✅ Разрабатывать типобезопасные React приложения с TypeScript
- ✅ Использовать современные инструменты разработки (Vite, Tailwind CSS)
- ✅ Эффективно управлять состоянием приложения (MobX, Zustand)
- ✅ Интегрироваться с REST API и другими внешними сервисами
- ✅ Писать автоматические unit, component и E2E тесты (Vitest, Playwright)
- ✅ Создавать адаптивные и доступные (a11y) интерфейсы
- ✅ Реализовать PWA функциональность (Service Workers, offline support)

### Backend разработка (LR8-11):

- ✅ Проектировать и создавать RESTful API с типизацией (Hono + TypeScript)
- ✅ Работать с базами данных через ORM (Prisma) type-safe способом
- ✅ Реализовать аутентификацию и авторизацию (JWT, OAuth, Role-based)
- ✅ Валидировать входные данные на сервере (Zod)
- ✅ Разработать бизнес-логику (scoring algorithm, calculations)
- ✅ Писать unit и integration тесты для backend
- ✅ Оптимизировать database queries и performance

### DevOps & Deployment (LR11, 13):

- ✅ Контейнеризировать приложения с Docker
- ✅ Настраивать CI/CD pipeline (GitHub Actions)
- ✅ Деплоить production-ready приложения (Vercel, Railway, Render)
- ✅ Мониторить приложение и ошибки (Sentry, Web Vitals)
- ✅ Обеспечивать security (HTTPS, CORS, input validation, rate limiting)

### Архитектура & Best Practices:

- ✅ Проектировать fullstack приложения (Frontend + Backend + Database)
- ✅ Использовать OpenAPI/Swagger для API документации
- ✅ Следовать принципам SOLID и clean code
- ✅ Оптимизировать производительность (bundle size, queries, caching)
- ✅ Писать масштабируемый и maintainable код
- ✅ Работать с Git и Pull Request процессом

### Практические навыки:

- ✅ Независимо разработать полноценное веб-приложение с нуля
- ✅ Работать с реальными tools и технологиями (Postman, Docker, DevTools)
- ✅ Отлаживать проблемы в production
- ✅ Читать и писать documentation (API docs, README, architecture)
- ✅ Применять test-driven development (TDD)
- ✅ Следовать типобезопасности везде (TypeScript)

### Что особенно ценно для career:

- **Fullstack skillset:** не просто frontend разработчик, а полноценный fullstack
- **Production experience:** реальный опыт с Docker, CI/CD, deployment
- **Modern stack:** технологии, которые ищут работодатели в 2026 году
- **Business logic:** опыт с реальной бизнес-логикой (scoring, validation, auth)
- **Code quality:** 70%+ test coverage, monitoring, security
- **Offline-first:** опыт с PWA и offline-first разработкой
