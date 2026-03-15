# Полное руководство: React паттерны, оптимизация и работа с API

## Содержание
1. [Введение](#введение)
2. [Обзор React паттернов](#паттерны)
   - [Custom Hooks](#custom-hooks)
   - [Compound Components](#compound-components)
   - [Render Props](#render-props)
   - [Context API](#context-api)
3. [Error Boundaries](#error-boundaries)
4. [Оптимизация производительности](#оптимизация)
   - [React.memo](#react-memo)
   - [useMemo](#usememo)
   - [useCallback](#usecallback)
   - [Профилирование](#профилирование)
5. [Работа с API через React Query](#react-query)
6. [OpenAPI и кодогенерация](#openapi)
7. [Best Practices](#best-practices)

---

## Введение {#введение}

### О чём эта лекция

Эта лекция — **повторение и углубление** пройденного материала + **новые важные темы**:

1. **Обзор паттернов** — быстрое повторение Custom Hooks, Compound Components, Render Props, Context из LR2
2. **Error Boundaries** — профессиональная обработка ошибок в React
3. **Оптимизация** — когда и как использовать memo, useMemo, useCallback
4. **React Query** — современный стандарт работы с API

### Для кого эта лекция

✅ Вы прошли LR2 (React + TypeScript)
✅ Знаете основные хуки (useState, useEffect, useContext)
✅ Понимаете TypeScript базово

---

## Обзор React паттернов {#паттерны}

> 📝 **Примечание**: Эти паттерны подробно разбирались в LR2. Здесь — краткое повторение.

### Таблица сравнения паттернов

| Паттерн | Что решает | Когда использовать | Пример |
|---------|------------|-------------------|--------|
| **Custom Hooks** | Переиспользование stateful логики | Любая логика с состоянием | `useToggle`, `useDebounce` |
| **Compound Components** | Гибкие составные UI | Сложные компоненты с частями | `<Tabs>`, `<Accordion>` |
| **Render Props** | Разделение логики и UI | Разный UI с одной логикой | DataFetcher, MouseTracker |
| **Context API** | Избегание prop drilling | Глобальное состояние | Theme, Auth, Language |

---

### Custom Hooks {#custom-hooks}

**Быстрое напоминание**: Custom Hooks — это функции, начинающиеся с `use`, которые используют встроенные хуки React.

#### Пример: useToggle

```typescript
import { useState, useCallback } from 'react';

function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Использование
function Modal() {
  const { value: isOpen, toggle, setTrue } = useToggle(false);

  return (
    <>
      <button onClick={setTrue}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <h2>Modal Title</h2>
          <button onClick={toggle}>Close</button>
        </div>
      )}
    </>
  );
}
```

**Когда создавать Custom Hook:**
- Логика используется в нескольких компонентах
- Есть состояние + эффекты + функции
- Хотите изолировать сложную логику

---

### Compound Components {#compound-components}

**Быстрое напоминание**: Компоненты, которые работают вместе через общий Context.

#### Пример: Card

```typescript
import { createContext, useContext, ReactNode } from 'react';

// Простой вариант без Context (для статичных компонентов)
interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

const CardHeader = ({ children }: { children: ReactNode }) => (
  <div className="card-header">{children}</div>
);

const CardBody = ({ children }: { children: ReactNode }) => (
  <div className="card-body">{children}</div>
);

const CardFooter = ({ children }: { children: ReactNode }) => (
  <div className="card-footer">{children}</div>
);

// Attach compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Использование
function UserProfile() {
  return (
    <Card>
      <Card.Header>
        <h2>John Doe</h2>
      </Card.Header>
      <Card.Body>
        <p>Frontend Developer</p>
        <p>john@example.com</p>
      </Card.Body>
      <Card.Footer>
        <button>Edit Profile</button>
      </Card.Footer>
    </Card>
  );
}
```

**Когда использовать:**
- Компонент состоит из нескольких логических частей
- Нужна гибкость в композиции
- Хотите красивый API

---

### Render Props {#render-props}

**Быстрое напоминание**: Паттерн передачи функции через props для рендера.

#### Пример: DataFetcher

```typescript
import { useState, useEffect, ReactNode } from 'react';

interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Использование
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  return (
    <DataFetcher<User> url={`/api/users/${userId}`}>
      {(user, loading, error) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!user) return <div>No user found</div>;

        return (
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

**Render Props vs Custom Hooks:**
- Render Props: разный UI с одной логикой
- Custom Hooks: переиспользование логики (современный подход)

---

### Context API {#context-api}

**Быстрое напоминание**: Способ передать данные через дерево компонентов без prop drilling.

#### Пример: Theme Context

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook для использования контекста
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Использование
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={theme}>
      <h1>My App</h1>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'}
      </button>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}
```

**Когда использовать Context:**
- Данные нужны в многих компонентах на разных уровнях
- Хотите избежать prop drilling
- Глобальное состояние (theme, auth, language)

**⚠️ Когда НЕ использовать:**
- Для передачи через 1-2 уровня (просто используйте props)
- Для частообновляемых данных (будет много ре-рендеров)

---

## Error Boundaries {#error-boundaries}

### Проблема

В React ошибка в одном компоненте **крашит всё приложение**:

```typescript
function BuggyComponent() {
  throw new Error('Oops! Something went wrong');
  return <div>This will never render</div>;
}

function App() {
  return (
    <div>
      <h1>My App</h1>
      <BuggyComponent /> {/* Весь App упадёт! */}
    </div>
  );
}
```

**Результат**: Белый экран смерти (WSOD) 💀

### Решение: Error Boundaries

**Error Boundary** — это React-компонент, который ловит ошибки в дочерних компонентах и показывает fallback UI.

### Создание Error Boundary

```typescript
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Вызывается при ошибке - обновляет state
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  // Вызывается после отлова ошибки - для логирования
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Здесь можно отправить ошибку в сервис мониторинга
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', border: '1px solid red' }}>
            <h2>⚠️ Something went wrong</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
            </details>
            <button onClick={this.resetError}>Try again</button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Использование

```typescript
function App() {
  return (
    <div>
      <h1>My App</h1>

      {/* Весь App защищён */}
      <ErrorBoundary>
        <Header />
        <MainContent />
        <Footer />
      </ErrorBoundary>

      {/* Или защитить только часть */}
      <div>
        <Sidebar />
        <ErrorBoundary fallback={<div>Widget failed to load</div>}>
          <ComplexWidget />
        </ErrorBoundary>
      </div>
    </div>
  );
}
```

### Что НЕ ловит Error Boundary

❌ **Не ловит:**
- Ошибки в обработчиках событий (onClick, onChange)
- Асинхронный код (setTimeout, fetch)
- Ошибки в самом Error Boundary
- SSR (серверный рендеринг)

✅ **Ловит:**
- Ошибки при рендере
- Ошибки в методах жизненного цикла
- Ошибки в конструкторах

### Обработка ошибок в обработчиках событий

```typescript
function MyComponent() {
  const handleClick = () => {
    try {
      // Опасный код
      dangerousOperation();
    } catch (error) {
      console.error('Error in event handler:', error);
      // Показать уведомление пользователю
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Множественные Error Boundaries

```typescript
function App() {
  return (
    <ErrorBoundary fallback={<div>App failed</div>}>
      <Header />

      <main>
        <ErrorBoundary fallback={<div>Sidebar failed</div>}>
          <Sidebar />
        </ErrorBoundary>

        <ErrorBoundary fallback={<div>Content failed</div>}>
          <Content />
        </ErrorBoundary>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}
```

**Преимущества:**
- Более детальная обработка
- Часть UI может работать при ошибке в другой части
- Лучший UX

### Интеграция с логированием

```typescript
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Отправка в Sentry
    // Sentry.captureException(error, { extra: errorInfo });

    // Или свой backend
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

### Best Practices

1. **Размещайте Error Boundaries стратегически**
   - На уровне layout (для всего приложения)
   - На уровне роутов (для каждой страницы)
   - Вокруг сложных виджетов

2. **Хороший fallback UI**
   ```typescript
   <ErrorBoundary fallback={
     <div>
       <h2>Oops! Something went wrong</h2>
       <p>We're working on fixing this issue.</p>
       <button onClick={() => window.location.reload()}>
         Reload page
       </button>
     </div>
   } />
   ```

3. **Логирование в production**
   - Всегда логируйте ошибки
   - Используйте сервисы мониторинга (Sentry, LogRocket)

4. **Не используйте для flow control**
   ```typescript
   // ❌ Плохо
   <ErrorBoundary fallback={<LoginPage />}>
     <PrivateRoute />
   </ErrorBoundary>

   // ✅ Хорошо
   {isAuthenticated ? <PrivateRoute /> : <LoginPage />}
   ```

---

## Оптимизация производительности {#оптимизация}

### Проблемы производительности

**Основная проблема React**: Лишние ре-рендеры

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild />  {/* Ре-рендерится при каждом клике! */}
    </div>
  );
}
```

### Как найти проблемы

**React DevTools Profiler:**

1. Откройте React DevTools
2. Перейдите во вкладку "Profiler"
3. Нажмите "Start profiling"
4. Взаимодействуйте с приложением
5. Нажмите "Stop profiling"
6. Смотрите flame chart

**Что искать:**
- Компоненты, которые рендерятся часто
- Компоненты с долгим временем рендера
- Компоненты, которые рендерятся без изменений props

---

### React.memo {#react-memo}

**React.memo** — это HOC, который мемоизирует компонент и пропускает ре-рендер, если props не изменились.

#### Базовое использование

```typescript
import { memo } from 'react';

interface Props {
  name: string;
  age: number;
}

// Без memo - ре-рендерится всегда
function UserCard({ name, age }: Props) {
  console.log('UserCard rendered');
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

// С memo - ре-рендерится только при изменении props
const UserCardMemo = memo(UserCard);

export default UserCardMemo;
```

#### Кастомное сравнение

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const ProductCard = memo(
  ({ product }: { product: Product }) => {
    console.log('ProductCard rendered');
    return (
      <div>
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    );
  },
  // Кастомная функция сравнения
  (prevProps, nextProps) => {
    // Возвращаем true, если пропсы равны (НЕ нужен ре-рендер)
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price
    );
  }
);
```

#### Когда использовать React.memo

✅ **Используйте если:**
- Компонент рендерится часто с одинаковыми props
- Компонент дорогой в рендере (сложные вычисления, большой DOM)
- Компонент в списке

❌ **Не используйте если:**
- Props меняются при каждом рендере
- Компонент простой и быстрый
- Нет проблем с производительностью

---

### useMemo {#usememo}

**useMemo** — хук для мемоизации **вычислений**.

#### Базовое использование

```typescript
import { useMemo, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

function ProductList({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');

  // ❌ Без useMemo - фильтрация при каждом рендере
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  // ✅ С useMemo - фильтрация только при изменении products или filter
  const filteredMemo = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]); // dependency array

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search..."
      />
      <div>
        {filteredMemo.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}
```

#### Дорогие вычисления

```typescript
function ExpensiveCalculation({ numbers }: { numbers: number[] }) {
  // Дорогая операция - мемоизируем
  const sum = useMemo(() => {
    console.log('Calculating sum...');
    return numbers.reduce((acc, n) => acc + n, 0);
  }, [numbers]);

  const average = useMemo(() => {
    console.log('Calculating average...');
    return sum / numbers.length;
  }, [sum, numbers.length]);

  return (
    <div>
      <p>Sum: {sum}</p>
      <p>Average: {average}</p>
    </div>
  );
}
```

#### Когда использовать useMemo

✅ **Используйте если:**
- Вычисления действительно дорогие (циклы, фильтрация больших массивов)
- Результат передаётся в компонент с React.memo
- Создание объектов/массивов для dependency arrays

❌ **Не используйте если:**
- Простые вычисления (сложение, умножение)
- Вычисления и так быстрые
- "На всякий случай"

**Правило:** Измерьте сначала, оптимизируйте потом!

---

### useCallback {#usecallback}

**useCallback** — хук для мемоизации **функций**.

#### Базовое использование

```typescript
import { useState, useCallback, memo } from 'react';

interface ItemProps {
  item: { id: number; name: string };
  onSelect: (id: number) => void;
}

// Мемоизированный компонент
const Item = memo(({ item, onSelect }: ItemProps) => {
  console.log('Item rendered:', item.name);
  return (
    <div onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  );
});

function ItemList() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  // ❌ Без useCallback - новая функция при каждом рендере
  // Item будет ре-рендериться всегда, даже с memo!
  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  // ✅ С useCallback - та же функция, если deps не изменились
  const handleSelectMemo = useCallback((id: number) => {
    setSelectedId(id);
  }, []); // нет зависимостей

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          item={item}
          onSelect={handleSelectMemo}
        />
      ))}
    </div>
  );
}
```

#### useCallback с зависимостями

```typescript
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');

  // Функция зависит от filter
  const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));

    console.log('Current filter:', filter); // используем filter
  }, [filter]); // filter в dependencies

  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
      ))}
    </div>
  );
}
```

#### useCallback vs useMemo

```typescript
// useCallback - мемоизирует функцию
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo - мемоизирует результат
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - это синтаксический сахар для useMemo
const memoizedCallback2 = useMemo(() => {
  return () => doSomething(a, b);
}, [a, b]);
```

#### Когда использовать useCallback

✅ **Используйте если:**
- Функция передаётся в мемоизированный компонент
- Функция в dependency array другого хука
- Оптимизируете производительность списков

❌ **Не используйте если:**
- Функция используется только внутри компонента
- Компонент и так быстрый
- Нет React.memo на дочерних компонентах

---

### Профилирование {#профилирование}

#### React DevTools Profiler

**Шаги:**

1. Установите [React DevTools](https://react.dev/learn/react-developer-tools)
2. Откройте вкладку "Profiler"
3. Нажмите "Start profiling" (🔴)
4. Взаимодействуйте с приложением
5. Нажмите "Stop profiling" (⏹️)
6. Анализируйте результаты

**Что смотреть:**

- **Flame Chart**: какие компоненты рендерятся и сколько времени тратят
- **Ranked Chart**: компоненты по времени рендера
- **Component renders**: сколько раз компонент рендерился

#### Профилирование в коде

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id, // id Profiler
  phase, // "mount" или "update"
  actualDuration, // время рендера
  baseDuration, // оценочное время без мемоизации
  startTime, // когда React начал рендер
  commitTime, // когда React закоммитил
  interactions // Set of interactions
) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Main />
      <Footer />
    </Profiler>
  );
}
```

#### Chrome Performance

1. Откройте DevTools → Performance
2. Нажмите "Record" (●)
3. Взаимодействуйте с приложением
4. Остановите запись
5. Анализируйте User Timing

**Смотрите на:**
- Долгие задачи (Long Tasks)
- Layout/Paint операции
- JavaScript execution time

### Чек-лист оптимизации

1. ✅ **Измерьте сначала** — используйте Profiler
2. ✅ **Оптимизируйте узкие места** — не оптимизируйте всё подряд
3. ✅ **React.memo** для компонентов с стабильными props
4. ✅ **useMemo** для дорогих вычислений
5. ✅ **useCallback** для функций в мемоизированных компонентах
6. ✅ **Профилируйте после** — убедитесь, что стало лучше

**❗ Помните:** Преждевременная оптимизация — корень всех зол!

---

## Работа с API через React Query {#react-query}

### Проблемы с обычным fetch

```typescript
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Много boilerplate, нет кэширования, нет ре-фетча...
}
```

**Проблемы:**
- ❌ Много boilerplate кода
- ❌ Нет кэширования
- ❌ Нет автоматического обновления
- ❌ Дублирование логики
- ❌ Сложная синхронизация

### Введение в React Query

**React Query (TanStack Query)** — мощная библиотека для работы с серверным состоянием.

**Преимущества:**
- ✅ Автоматическое кэширование
- ✅ Фоновое обновление
- ✅ Дедупликация запросов
- ✅ Optimistic updates
- ✅ Pagination, infinite scroll
- ✅ DevTools из коробки

### Установка

```bash
npm install @tanstack/react-query
# или
yarn add @tanstack/react-query
# или
pnpm add @tanstack/react-query
```

### Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Создаём клиент
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      cacheTime: 1000 * 60 * 10, // 10 минут
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### useQuery - получение данных

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

// Функция для запроса
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'], // уникальный ключ для кэша
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### queryKey - ключи кэша

```typescript
// Простой ключ
useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// С параметрами
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// С фильтрами
useQuery({
  queryKey: ['users', { role: 'admin', active: true }],
  queryFn: () => fetchUsers({ role: 'admin', active: true }),
});

// Иерархия ключей
useQuery({ queryKey: ['users'], ... });                    // все users
useQuery({ queryKey: ['users', 1], ... });                 // user с id 1
useQuery({ queryKey: ['users', 1, 'posts'], ... });        // posts user'а 1
```

### useMutation - изменение данных

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserData {
  name: string;
  email: string;
}

const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Инвалидировать кэш users - вызовет refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Или обновить кэш напрямую
      queryClient.setQueryData<User[]>(['users'], (old) => {
        return old ? [...old, newUser] : [newUser];
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && (
        <div style={{ color: 'red' }}>
          Error: {mutation.error.message}
        </div>
      )}
      {mutation.isSuccess && (
        <div style={{ color: 'green' }}>User created!</div>
      )}
    </form>
  );
}
```

### Оптимистичные обновления

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // Отменить текущие refetch'и
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // Snapshot предыдущего значения
    const previousUsers = queryClient.getQueryData<User[]>(['users']);

    // Оптимистично обновить
    queryClient.setQueryData<User[]>(['users'], (old) => {
      return old?.map(user =>
        user.id === newUser.id ? { ...user, ...newUser } : user
      );
    });

    // Вернуть context для rollback
    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // Rollback при ошибке
    queryClient.setQueryData(['users'], context?.previousUsers);
  },
  onSettled: () => {
    // Всегда refetch после завершения
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### Интеграция с Error Boundaries

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <h2>Something went wrong:</h2>
              <pre>{error.message}</pre>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <YourApp />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### Best Practices

1. **Хорошие queryKey**
   ```typescript
   // ❌ Плохо
   useQuery({ queryKey: ['data'], ... });

   // ✅ Хорошо
   useQuery({ queryKey: ['users', { status: 'active' }], ... });
   ```

2. **Централизованные query functions**
   ```typescript
   // api/users.ts
   export const usersApi = {
     getAll: () => fetch('/api/users').then(r => r.json()),
     getOne: (id: number) => fetch(`/api/users/${id}`).then(r => r.json()),
     create: (data: CreateUserData) =>
       fetch('/api/users', {
         method: 'POST',
         body: JSON.stringify(data),
       }).then(r => r.json()),
   };

   // components/UserList.tsx
   const { data } = useQuery({
     queryKey: ['users'],
     queryFn: usersApi.getAll,
   });
   ```

3. **Правильные staleTime и cacheTime**
   ```typescript
   // Данные редко меняются
   useQuery({
     queryKey: ['config'],
     queryFn: fetchConfig,
     staleTime: Infinity, // никогда не stale
   });

   // Данные часто меняются
   useQuery({
     queryKey: ['stock-price'],
     queryFn: fetchStockPrice,
     staleTime: 0, // всегда stale
     refetchInterval: 5000, // refetch каждые 5 сек
   });
   ```

4. **Обработка loading и error states**
   ```typescript
   const { data, isLoading, isError, error } = useQuery({
     queryKey: ['users'],
     queryFn: fetchUsers,
   });

   if (isLoading) return <Spinner />;
   if (isError) return <ErrorMessage error={error} />;
   if (!data) return <EmptyState />;

   return <UserList users={data} />;
   ```

---

## OpenAPI и кодогенерация {#openapi}

### Проблема ручной типизации API

Когда вы работаете с backend API, возникает проблема синхронизации TypeScript типов с реальной структурой данных:

**Проблемы:**
- Backend добавляет/удаляет поля — TypeScript не знает об этом
- Переименование полей приводит к runtime ошибкам
- Дублирование кода: типы пишутся и на backend, и на frontend
- Человеческий фактор при копировании типов

**Пример проблемы:**

```typescript
// Backend возвращает
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "role": "admin" // новое поле!
}

// Frontend типы (устарели!)
interface User {
  id: number;
  name: string;
  email: string;
  // role отсутствует!
}

// TypeScript не ловит ошибку
function displayUserRole(user: User) {
  return user.role; // undefined в runtime!
}
```

### OpenAPI/Swagger стандарт

**OpenAPI** — это стандарт описания REST API в формате JSON или YAML.

**Основные концепции:**
- **Paths** — описание эндпоинтов (GET, POST, PUT, DELETE)
- **Schemas** — описание моделей данных
- **Responses** — описание ответов API
- **Parameters** — query, path, header параметры

**Пример OpenAPI схемы:**

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users:
    get:
      summary: Получить всех пользователей
      responses:
        '200':
          description: Список пользователей
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Создать пользователя
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: Пользователь создан
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/{id}:
    get:
      summary: Получить пользователя по ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Данные пользователя
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        role:
          type: string
          enum: [admin, user, moderator]
          example: "user"

    CreateUserDto:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, user, moderator]
```

**Как создавать OpenAPI схемы:**

1. **Вручную** в редакторе (Swagger Editor, Stoplight Studio)
2. **Автоматически** из backend кода:
   - NestJS: `@nestjs/swagger`
   - FastAPI: встроенная генерация
   - Express: `swagger-jsdoc`, `tsoa`
3. **Из Postman коллекций** (экспорт в OpenAPI)

### Генерация TypeScript типов

После создания OpenAPI схемы можно автоматически генерировать TypeScript код.

#### Инструменты

**1. openapi-typescript** — генерация чистых TypeScript типов

```bash
npm install -D openapi-typescript

npx openapi-typescript ./openapi.yaml -o ./src/types/api.ts
```

Результат:
```typescript
// src/types/api.ts (сгенерировано автоматически)
export interface paths {
  "/api/users": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["User"][];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["CreateUserDto"];
        };
      };
      responses: {
        201: {
          content: {
            "application/json": components["schemas"]["User"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    User: {
      id: number;
      name: string;
      email: string;
      role?: "admin" | "user" | "moderator";
    };
    CreateUserDto: {
      name: string;
      email: string;
      role?: "admin" | "user" | "moderator";
    };
  };
}
```

**2. orval** — генерация React Query хуков + типы

```bash
npm install -D orval

# Конфигурация orval.config.ts
export default {
  api: {
    input: './openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customFetch',
        },
      },
    },
  },
};

npx orval
```

Результат:
```typescript
// src/api/generated/users.ts (сгенерировано автоматически)
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customFetch } from '../client';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'moderator';
}

// Автоматически сгенерированный хук
export const useGetUsers = <TData = User[]>(
  options?: UseQueryOptions<User[], Error, TData>
) => {
  return useQuery<User[], Error, TData>(
    ['users'],
    () => customFetch<User[]>('/api/users'),
    options
  );
};

// Автоматически сгенерированный хук
export const useCreateUser = <TData = User>(
  options?: UseMutationOptions<User, Error, CreateUserDto>
) => {
  return useMutation<User, Error, CreateUserDto>(
    (data) => customFetch<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    options
  );
};

// Автоматически сгенерированный хук
export const useGetUser = <TData = User>(
  id: number,
  options?: UseQueryOptions<User, Error, TData>
) => {
  return useQuery<User, Error, TData>(
    ['users', id],
    () => customFetch<User>(`/api/users/${id}`),
    options
  );
};
```

**3. @rtk-query/codegen** — для RTK Query

```bash
npm install -D @rtk-query/codegen-openapi

npx @rtk-query/codegen-openapi openapi-config.ts
```

### Использование сгенерированного кода

**С openapi-typescript:**

```typescript
import { components } from './types/api';

type User = components['schemas']['User'];

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  return res.json();
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name} - {user.role}
        </div>
      ))}
    </div>
  );
}
```

**С orval (React Query):**

```typescript
import { useGetUsers, useCreateUser, useGetUser } from './api/generated/users';

function UserList() {
  const { data, isLoading, error } = useGetUsers();
  // data имеет тип User[] автоматически!

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>
          {user.name} ({user.email}) - {user.role}
        </div>
      ))}
    </div>
  );
}

function CreateUserForm() {
  const mutation = useCreateUser();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: 'user', // TypeScript знает, что это enum!
    }, {
      onSuccess: () => {
        alert('User created!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}

function UserDetail({ userId }: { userId: number }) {
  const { data: user } = useGetUser(userId);

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Workflow разработки

**Типичный workflow с OpenAPI кодогенерацией:**

1. **Backend разработчик:**
   - Создаёт/обновляет API
   - Генерирует/обновляет OpenAPI схему
   - Коммитит схему в репозиторий

2. **Frontend разработчик:**
   - Пуллит изменения
   - Запускает кодогенерацию: `npm run codegen`
   - Получает обновлённые типы и хуки
   - Использует в компонентах

3. **CI/CD pipeline:**
   - Автоматически проверяет валидность OpenAPI схемы
   - Запускает кодогенерацию
   - Проверяет, что нет TypeScript ошибок

**Автоматизация:**

```json
// package.json
{
  "scripts": {
    "codegen": "orval",
    "codegen:watch": "orval --watch",
    "postinstall": "npm run codegen"
  }
}
```

**Pre-commit hook (Husky):**

```bash
#!/bin/sh
# .husky/pre-commit

# Регенерировать при изменении OpenAPI схемы
if git diff --cached --name-only | grep -q "openapi.yaml"; then
  npm run codegen
  git add src/api/generated
fi
```

### Преимущества кодогенерации

| Преимущество | Описание |
|--------------|----------|
| **Type Safety** | Полная типизация API на уровне компиляции |
| **Синхронизация** | Типы всегда соответствуют реальному API |
| **DX (Developer Experience)** | Автодополнение для эндпоинтов и полей |
| **Экономия времени** | Не нужно писать типы и хуки вручную |
| **Документация** | OpenAPI = живая документация API |
| **Тестирование** | Mock-серверы из OpenAPI (Prism, MSW) |

### Альтернативные подходы

Если OpenAPI не подходит:

**1. tRPC** (для TypeScript fullstack)

```typescript
// backend (tRPC router)
export const userRouter = t.router({
  list: t.procedure.query(() => db.users.findMany()),
  create: t.procedure
    .input(z.object({ name: z.string(), email: z.string() }))
    .mutation(({ input }) => db.users.create(input)),
});

// frontend (типы автоматически!)
const users = trpc.user.list.useQuery();
const createUser = trpc.user.create.useMutation();
```

**2. GraphQL Code Generator**

```bash
npm install -D @graphql-codegen/cli

npx graphql-codegen --config codegen.yml
```

**3. Zodios** (Zod + Axios)

```typescript
import { Zodios } from '@zodios/core';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const api = new Zodios('https://api.example.com', [
  {
    method: 'get',
    path: '/users',
    response: z.array(userSchema),
  },
]);

const users = await api.get('/users'); // типизировано!
```

---

## Best Practices {#best-practices}

### 1. Паттерны

**Когда использовать что:**
- Custom Hooks → переиспользование stateful логики
- Compound Components → гибкие составные UI компоненты
- Render Props → разный UI с одной логикой (устаревает)
- Context → глобальное состояние, избегание prop drilling

**Не смешивайте всё подряд!** Выберите один паттерн для задачи.

### 2. Error Boundaries

- ✅ Размещайте на уровне layout, routes, widgets
- ✅ Логируйте все ошибки (Sentry, LogRocket)
- ✅ Показывайте понятный fallback UI
- ❌ Не используйте для flow control

### 3. Оптимизация

- ✅ **Измеряйте сначала** — используйте React Profiler
- ✅ **Оптимизируйте узкие места** — не всё подряд
- ✅ **React.memo** для дорогих компонентов со стабильными props
- ✅ **useMemo** для действительно дорогих вычислений
- ✅ **useCallback** для функций в мемоизированных компонентах
- ❌ **Не оптимизируйте преждевременно!**

### 4. React Query

- ✅ Используйте осмысленные queryKey
- ✅ Централизуйте API функции
- ✅ Настройте правильные staleTime и cacheTime
- ✅ Обрабатывайте loading и error states
- ✅ Используйте DevTools для отладки
- ❌ Не храните UI state в React Query

### 5. TypeScript

```typescript
// ✅ Хорошо - типизация всего
interface User {
  id: number;
  name: string;
  email: string;
}

const { data } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// ✅ Хорошо - generic компоненты
const ErrorBoundary = <T extends Error>(...) => { ... };

// ❌ Плохо - any
const { data }: any = useQuery(...);
```

---

## Заключение

### Что изучили

1. ✅ **Обзор паттернов** — Custom Hooks, Compound Components, Render Props, Context
2. ✅ **Error Boundaries** — профессиональная обработка ошибок
3. ✅ **Оптимизация** — memo, useMemo, useCallback, профилирование
4. ✅ **React Query** — современный стандарт работы с API

### Дальнейшее изучение

- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [React Performance](https://react.dev/learn/render-and-commit)

### Практика

Лучший способ освоить — **практиковаться**:
1. Создайте приложение с React Query
2. Добавьте Error Boundaries
3. Профилируйте и оптимизируйте
4. Используйте паттерны там, где они нужны

Успехов в разработке! 🚀
