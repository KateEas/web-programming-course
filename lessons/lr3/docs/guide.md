# Полное руководство: Vite + Tailwind CSS

## Содержание
1. [Введение](#введение)
2. [Vite vs Create React App](#vite-vs-create-react-app)
3. [Настройка проекта](#настройка-проекта)
4. [Конфигурация Vite](#конфигурация-vite)
5. [Введение в Tailwind CSS](#введение-в-tailwind-css)
6. [Utility-First подход](#utility-first-подход)
7. [Интеграция Tailwind с Vite](#интеграция-tailwind-с-vite)
8. [Hot Module Replacement](#hot-module-replacement)
9. [ESLint и Prettier](#eslint-и-prettier)
10. [Best Practices](#best-practices)

---

## Введение

Современная разработка фронтенда требует быстрых инструментов и эффективных подходов к стилизации. В этом руководстве мы рассмотрим связку **Vite + Tailwind CSS** — мощную комбинацию для создания современных веб-приложений.

### Что мы изучим:
- **Vite** - сверхбыстрый сборщик для разработки
- **Tailwind CSS** - utility-first CSS фреймворк
- **TypeScript** - статическая типизация для надежности
- **HMR** - мгновенные обновления при разработке

---

## Vite vs Create React App

### Что такое Vite?

**Vite** (фр. "быстрый") — это инструмент сборки нового поколения, созданный Эваном Ю (создателем Vue.js).

### Сравнительная таблица

| Характеристика | Vite | Create React App (CRA) |
|---------------|------|------------------------|
| **Запуск dev-сервера** | ~300ms | ~20-30s |
| **Hot Module Replacement** | Мгновенный | 1-3s |
| **Технология** | ES Modules + esbuild | Webpack |
| **Bundle size** | Меньше | Больше |
| **Конфигурация** | Простая | Требует eject |
| **Поддержка TypeScript** | Из коробки | Из коробки |
| **Tree-shaking** | Автоматически | Требует настройки |

### Преимущества Vite

#### 1. Скорость разработки
```bash
# CRA - холодный старт
$ npm start
⏱️  Starting development server... (25 seconds)

# Vite - холодный старт
$ npm run dev
⚡️ Vite dev server running in 287ms
```

#### 2. Мгновенный HMR
Vite использует нативные ES модули браузера, поэтому при изменении файла обновляется только этот модуль, а не весь бандл.

```typescript
// Изменение в Button.tsx
// CRA: Перезагрузка всего приложения (~2-3s)
// Vite: Обновление только Button (~50ms)
```

#### 3. Оптимизированный production build
Vite использует Rollup для production сборки, что дает лучшее tree-shaking и меньший размер бандла.

```bash
# Размер production bundle
CRA:  500-800 KB (gzipped)
Vite: 300-500 KB (gzipped)
```

### Когда использовать CRA?

- Легаси проекты, уже использующие CRA
- Если нужна стабильность (CRA проверен годами)
- Проекты с очень специфичными Webpack плагинами

### Когда использовать Vite?

- ✅ Новые проекты
- ✅ Когда важна скорость разработки
- ✅ Современные браузеры
- ✅ TypeScript проекты

---

## Настройка проекта

### Создание нового проекта с Vite

#### Шаг 1: Инициализация проекта

```bash
# С помощью npm
npm create vite@latest my-app -- --template react-ts

# С помощью yarn
yarn create vite my-app --template react-ts

# С помощью pnpm
pnpm create vite my-app --template react-ts
```

#### Шаг 2: Установка зависимостей

```bash
cd my-app
npm install
```

#### Шаг 3: Запуск dev-сервера

```bash
npm run dev
```

Ваше приложение запустится на `http://localhost:5173`

### Структура проекта

```
my-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Ключевые файлы

#### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Точка входа - TypeScript модуль -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Важно:** HTML файл находится в корне проекта, а не в `public/`, в отличие от CRA.

#### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### package.json
```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## Конфигурация Vite

### vite.config.ts

Базовая конфигурация Vite минималистична:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Расширенная конфигурация

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Алиасы для импортов
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Настройки dev-сервера
  server: {
    port: 3000,
    open: true, // Автоматически открыть браузер
    host: true, // Доступ по сети
    proxy: {
      // Проксирование API запросов
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Production build настройки
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',

    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },

  // Определение глобальных переменных
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
```

### Использование алиасов

После настройки алиасов:

```typescript
// Было:
import Button from '../../../components/ui/Button'

// Стало:
import Button from '@components/ui/Button'
```

### Environment Variables

#### Создание .env файлов

```bash
# .env
VITE_API_URL=http://localhost:3000/api

# .env.development
VITE_API_URL=http://localhost:8080/api

# .env.production
VITE_API_URL=https://api.production.com
```

#### Использование в коде

```typescript
// Доступ к env переменным
const apiUrl = import.meta.env.VITE_API_URL

// Проверка режима
if (import.meta.env.DEV) {
  console.log('Development mode')
}

if (import.meta.env.PROD) {
  console.log('Production mode')
}
```

**Важно:** Все переменные окружения должны начинаться с `VITE_`

### TypeScript настройки для env

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // Добавьте другие переменные
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Введение в Tailwind CSS

### Что такое Tailwind CSS?

Tailwind CSS — это **utility-first** CSS фреймворк, который предоставляет низкоуровневые utility классы для построения кастомных дизайнов.

### Традиционный CSS vs Tailwind

#### Традиционный подход
```html
<!-- HTML -->
<button class="btn btn-primary">
  Click me
</button>

<!-- CSS -->
<style>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
```

#### Tailwind подход
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors">
  Click me
</button>
```

### Преимущества Tailwind

#### 1. Нет naming проблем
Не нужно придумывать имена для CSS классов:
```html
<!-- Не нужно думать об именах -->
<div class="flex items-center justify-between p-4">
  <!-- content -->
</div>
```

#### 2. Предсказуемость
Каждый класс делает одну вещь:
```html
<!-- bg-blue-500 всегда делает фон синим -->
<!-- p-4 всегда добавляет padding: 1rem -->
<div class="bg-blue-500 p-4">Предсказуемо</div>
```

#### 3. Оптимизация размера
Tailwind удаляет неиспользуемые классы в production:
```bash
# Development: ~3.5 MB CSS
# Production:  ~10-20 KB CSS (только использованные классы)
```

#### 4. Responsive дизайн
```html
<!-- Разные стили для разных экранов -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<!-- 1 колонка на мобильных, 3 на десктопах -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- items -->
</div>
```

#### 5. Темизация из коробки
```html
<!-- Dark mode -->
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Адаптивная тема
</div>
```

### Недостатки Tailwind

#### 1. Длинные списки классов
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
  Long class list
</button>
```

**Решение:** Извлекайте компоненты или используйте `@apply`

#### 2. Кривая обучения
Нужно запомнить множество классов и их сокращения.

**Решение:** IDE расширения, документация, практика

---

## Utility-First подход

### Философия

Вместо создания semantic классов (`.card`, `.button`), вы используете utility классы (`.bg-white`, `.rounded`, `.p-4`).

### Пример: Создание карточки

#### Шаг 1: Базовые стили
```html
<div class="bg-white">
  <h2>Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 2: Добавляем spacing
```html
<div class="bg-white p-6">
  <h2 class="mb-2">Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 3: Добавляем borders и shadows
```html
<div class="bg-white p-6 rounded-lg shadow-md">
  <h2 class="mb-2">Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 4: Typography
```html
<div class="bg-white p-6 rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-2">Title</h2>
  <p class="text-gray-600">Description</p>
</div>
```

#### Шаг 5: Hover эффекты
```html
<div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
  <h2 class="text-xl font-bold mb-2">Title</h2>
  <p class="text-gray-600">Description</p>
</div>
```

### Компонентизация с Tailwind

Когда паттерн повторяется, извлекайте компонент:

```typescript
// components/Card.tsx
interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export function Card({ title, description, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Использование
<Card title="My Card" description="Card description" />
```

### @apply директива

Для часто повторяющихся паттернов можно использовать `@apply`:

```css
/* styles/components.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors;
  }

  .card {
    @apply bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow;
  }

  .input {
    @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}
```

```html
<button class="btn-primary">Click me</button>
<div class="card">Card content</div>
<input class="input" type="text" />
```

**Важно:** Используйте `@apply` умеренно. Слишком частое использование противоречит utility-first подходу.

---

## Интеграция Tailwind с Vite

### Установка Tailwind CSS

#### Шаг 1: Установка пакетов

```bash
npm install -D tailwindcss postcss autoprefixer
```

#### Шаг 2: Инициализация конфигурации

```bash
npx tailwindcss init -p
```

Это создаст два файла:
- `tailwind.config.js` — конфигурация Tailwind
- `postcss.config.js` — конфигурация PostCSS

#### Шаг 3: Настройка tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
```

#### Шаг 4: Добавление Tailwind directives в CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Кастомные глобальные стили */
@layer base {
  body {
    @apply font-sans antialiased;
  }

  h1 {
    @apply text-4xl font-bold;
  }

  h2 {
    @apply text-3xl font-semibold;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-500 hover:bg-blue-600 text-white;
  }

  .btn-secondary {
    @apply btn bg-gray-500 hover:bg-gray-600 text-white;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

#### Шаг 5: Импорт CSS в main.tsx

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Импортируем Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Проверка установки

Создайте тестовый компонент:

```typescript
// src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Tailwind CSS работает! 🎉
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-bold mb-2">Card {i}</h2>
              <p className="text-gray-600">
                This is a test card with Tailwind CSS styling.
              </p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Action
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
```

### Расширение конфигурации Tailwind

#### Кастомные цвета

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'brand': {
          light: '#85d7ff',
          DEFAULT: '#1fb6ff',
          dark: '#009eeb',
        },
        'accent': '#ff49db',
      }
    }
  }
}
```

```html
<div class="bg-brand text-white">Brand color</div>
<div class="bg-brand-light">Light brand</div>
<div class="bg-accent">Accent color</div>
```

#### Кастомные breakpoints

```javascript
// tailwind.config.js
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    }
  }
}
```

```html
<div class="text-sm xs:text-base md:text-lg xl:text-xl">
  Responsive text
</div>
```

---

## Hot Module Replacement

### Что такое HMR?

Hot Module Replacement (HMR) — это технология, позволяющая обновлять модули приложения без полной перезагрузки страницы, сохраняя состояние приложения.

### HMR в Vite

Vite предоставляет HMR из коробки с невероятной скоростью благодаря использованию ES модулей.

#### Как это работает

```typescript
// src/components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

// При изменении этого файла:
// 1. Vite обнаруживает изменение
// 2. Пересобирает только этот модуль
// 3. Отправляет обновление через WebSocket
// 4. Браузер применяет изменение без перезагрузки
// 5. Состояние React сохраняется!
```

### Fast Refresh

Vite использует React Fast Refresh, который сохраняет состояние компонентов при HMR:

```typescript
function App() {
  const [count, setCount] = useState(0)

  // Измените JSX или стили здесь
  // count останется прежним после HMR!

  return (
    <div className="p-4"> {/* Изменил padding с 2 на 4 */}
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Click me
      </button>
    </div>
  )
}
```

### HMR API

Для продвинутых случаев можно использовать HMR API:

```typescript
// src/config.ts
export const API_URL = 'http://localhost:3000'

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('Config updated:', newModule)
  })
}
```

### Troubleshooting HMR

#### Проблема: HMR не работает

```typescript
// ❌ Плохо - экспорт по умолчанию с анонимной функцией
export default () => {
  return <div>Component</div>
}

// ✅ Хорошо - именованная функция
export default function Component() {
  return <div>Component</div>
}

// ✅ Хорошо - named export
export function Component() {
  return <div>Component</div>
}
```

#### Проблема: Состояние сбрасывается

```typescript
// ❌ Плохо - состояние вне компонента
let count = 0

function Counter() {
  return <div>{count}</div> // Сбросится при HMR
}

// ✅ Хорошо - используйте React state
function Counter() {
  const [count, setCount] = useState(0)
  return <div>{count}</div> // Сохранится при HMR
}
```

---

## ESLint и Prettier

### Настройка ESLint

#### Установка

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks
```

#### Конфигурация .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

#### Scripts в package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

### Настройка Prettier

#### Установка

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

#### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### Интеграция с ESLint

Обновите `.eslintrc.cjs`:

```javascript
module.exports = {
  extends: [
    // ... другие extends
    'plugin:prettier/recommended', // Добавьте в конец
  ],
}
```

#### Scripts для Prettier

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

### Prettier Plugin для Tailwind

Автоматически сортирует Tailwind классы:

```bash
npm install -D prettier-plugin-tailwindcss
```

```typescript
// До
<div className="pt-2 p-4 text-center bg-blue-500">

// После форматирования
<div className="bg-blue-500 p-4 pt-2 text-center">
```

### VS Code настройки

Создайте `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["class:\\s*?[\"'`]([^\"'`]*).*?,", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["className:\\s*?[\"'`]([^\"'`]*).*?,", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Pre-commit hooks с Husky

#### Установка

```bash
npm install -D husky lint-staged

# Инициализация husky
npx husky-init && npm install
```

#### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

#### lint-staged конфигурация

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Best Practices

### 1. Организация Tailwind классов

#### Используйте порядок классов

```html
<!-- Layout -> Spacing -> Sizing -> Typography -> Visual -> Misc -->
<div class="flex items-center justify-between p-4 w-full text-lg font-bold bg-blue-500 rounded hover:bg-blue-600">
```

#### Разбивайте длинные списки

```typescript
const cardClasses = [
  // Layout
  'flex flex-col',
  // Spacing
  'p-6 gap-4',
  // Sizing
  'w-full max-w-md',
  // Visual
  'bg-white rounded-lg shadow-md',
  // Interactive
  'hover:shadow-xl transition-shadow',
].join(' ')

<div className={cardClasses}>
```

#### Используйте clsx или classnames

```bash
npm install clsx
```

```typescript
import clsx from 'clsx'

interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'small' | 'large'
  disabled?: boolean
}

function Button({ variant, size, disabled }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'rounded font-medium transition-colors',

        // Variants
        {
          'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
          'bg-gray-500 hover:bg-gray-600 text-white': variant === 'secondary',
        },

        // Sizes
        {
          'px-3 py-1 text-sm': size === 'small',
          'px-6 py-3 text-lg': size === 'large',
        },

        // States
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
    >
      Click me
    </button>
  )
}
```

### 2. Компонентная архитектура

```
src/
├── components/
│   ├── ui/              # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/          # Layout компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/        # Feature-специфичные компоненты
│       ├── auth/
│       └── products/
├── hooks/               # Кастомные хуки
├── utils/               # Утилиты
└── styles/              # Глобальные стили
    └── index.css
```

### 3. Responsive Design паттерны

#### Mobile-First подход

```html
<!-- Начинайте с мобильных стилей, добавляйте для больших экранов -->
<div class="p-2 md:p-4 lg:p-6">
  <h1 class="text-xl md:text-2xl lg:text-3xl">Title</h1>
</div>
```

#### Скрытие элементов

```html
<!-- Скрыть на мобильных -->
<div class="hidden md:block">Desktop only</div>

<!-- Скрыть на десктопах -->
<div class="md:hidden">Mobile only</div>

<!-- Разный контент -->
<div>
  <span class="md:hidden">☰ Menu</span>
  <span class="hidden md:inline">Navigation Menu</span>
</div>
```

### 4. Performance оптимизация

#### PurgeCSS (автоматически в production)

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind автоматически удалит неиспользуемые классы
}
```

#### Избегайте динамических классов

```typescript
// ❌ Плохо - классы могут быть удалены PurgeCSS
const color = 'blue'
<div className={`bg-${color}-500`}>Bad</div>

// ✅ Хорошо - используйте полные имена классов
const colorClass = color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
<div className={colorClass}>Good</div>

// ✅ Хорошо - используйте safelist
// tailwind.config.js
export default {
  safelist: [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
  ]
}
```

### 5. Темизация

#### Dark mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // или 'media'
  // ...
}
```

```typescript
// App.tsx
function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="text-black dark:text-white">
          <button onClick={() => setDarkMode(!darkMode)}>
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 6. Accessibility

```html
<!-- Используйте semantic HTML -->
<button class="...">Click me</button>

<!-- Добавляйте ARIA атрибуты -->
<button
  aria-label="Close menu"
  aria-expanded="false"
  class="..."
>
  ✕
</button>

<!-- Focus states -->
<input
  class="border focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
/>
```

---

## Заключение

Связка **Vite + Tailwind CSS** предоставляет современный, быстрый и эффективный способ разработки веб-приложений:

### Ключевые преимущества:

1. **Vite** — молниеносная разработка с HMR
2. **Tailwind CSS** — быстрая стилизация без написания CSS
3. **TypeScript** — безопасность типов
4. **Отличный DX** — ESLint, Prettier, IntelliSense

### Дальнейшие шаги:

- Изучите [Tailwind UI](https://tailwindui.com/) для готовых компонентов
- Попробуйте [Headless UI](https://headlessui.com/) для доступных компонентов
- Освойте [Tailwind Play](https://play.tailwindcss.com/) для экспериментов
- Изучите продвинутые возможности Vite (SSR, Library Mode)

Практикуйтесь, экспериментируйте и создавайте потрясающие приложения! 🚀
