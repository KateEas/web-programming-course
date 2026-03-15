# Шпаргалка: React паттерны, оптимизация и работа с API

Краткая справка по лекции LR5.

---

## 📦 Установка

```bash
# React Query
npm install @tanstack/react-query

# React Query DevTools
npm install @tanstack/react-query-devtools
```

---

## 🎯 React Паттерны (повторение из LR2)

### Custom Hooks

```typescript
// useToggle
function useToggle(initial: boolean = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return { value, toggle };
}

// Использование
const { value: isOpen, toggle } = useToggle();
```

### Compound Components

```typescript
// Card компонент
function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Body = ({ children }) => <div className="card-body">{children}</div>;
Card.Footer = ({ children }) => <div className="card-footer">{children}</div>;

// Использование
<Card>
  <Card.Header><h2>Title</h2></Card.Header>
  <Card.Body><p>Content</p></Card.Body>
  <Card.Footer><button>Action</button></Card.Footer>
</Card>
```

### Render Props

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  // ... fetch logic
  return <>{children(data, loading, error)}</>;
}

// Использование
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <div>{user.name}</div>;
  }}
</DataFetcher>
```

### Context API

```typescript
// Создание
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be within ThemeProvider');
  return context;
}

// Использование
function Header() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

---

## 🛡️ Error Boundaries

### Создание Error Boundary

```typescript
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error, errorInfo);
    // Отправить в Sentry / LogRocket
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Использование

```typescript
<ErrorBoundary fallback={<div>Error occurred</div>}>
  <YourComponent />
</ErrorBoundary>
```

### Что НЕ ловит

- ❌ Ошибки в обработчиках событий
- ❌ Асинхронный код
- ❌ SSR
- ✅ Ошибки при рендере

---

## ⚡ Оптимизация

### React.memo

Мемоизация компонента - пропускает ре-рендер если props не изменились.

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }: Props) => {
  console.log('Render');
  return <div>{data.name}</div>;
});

// С кастомным сравнением
const MemoComponent = memo(
  Component,
  (prevProps, nextProps) => {
    return prevProps.id === nextProps.id; // true = skip render
  }
);
```

**Когда использовать:**
- ✅ Дорогой рендер
- ✅ Часто рендерится с одинаковыми props
- ❌ Props меняются всегда
- ❌ Простой компонент

### useMemo

Мемоизация вычислений.

```typescript
import { useMemo } from 'react';

function ProductList({ products, filter }: Props) {
  // Вычисляется только при изменении products или filter
  const filtered = useMemo(() => {
    console.log('Filtering...');
    return products.filter(p => p.name.includes(filter));
  }, [products, filter]);

  return <div>{filtered.map(...)}</div>;
}
```

**Когда использовать:**
- ✅ Дорогие вычисления (циклы, фильтры больших массивов)
- ✅ Результат идёт в React.memo компонент
- ❌ Простые операции
- ❌ "На всякий случай"

### useCallback

Мемоизация функций.

```typescript
import { useCallback, memo } from 'react';

const Item = memo(({ item, onSelect }) => {
  console.log('Item rendered');
  return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
});

function List({ items }: Props) {
  const [selected, setSelected] = useState(null);

  // Без useCallback - новая функция каждый рендер
  // Item всегда ре-рендерится несмотря на memo!

  // С useCallback - та же функция
  const handleSelect = useCallback((id: number) => {
    setSelected(id);
  }, []); // пустой массив = функция никогда не меняется

  return items.map(item => (
    <Item key={item.id} item={item} onSelect={handleSelect} />
  ));
}
```

**Когда использовать:**
- ✅ Функция передаётся в memo-компонент
- ✅ Функция в dependency array
- ❌ Функция только внутри компонента

### Профилирование

```typescript
import { Profiler } from 'react';

<Profiler
  id="MyComponent"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} took ${actualDuration}ms`);
  }}
>
  <MyComponent />
</Profiler>
```

**React DevTools Profiler:**
1. Открыть DevTools → Profiler
2. Start profiling (🔴)
3. Взаимодействовать с приложением
4. Stop profiling (⏹️)
5. Анализировать flame chart

---

## 🔄 React Query

### Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

### useQuery - Получение данных

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

function UserList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### queryKey - Ключи кэша

```typescript
// Простой
useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// С параметром
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
});

// С фильтрами
useQuery({
  queryKey: ['users', { role: 'admin', active: true }],
  queryFn: () => fetchUsers({ role: 'admin', active: true })
});

// Иерархия
['users']              // все users
['users', 1]           // user с id=1
['users', 1, 'posts']  // posts user'а 1
```

### useMutation - Изменение данных

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserData {
  name: string;
  email: string;
}

const createUser = async (data: CreateUserData): Promise<User> => {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Обновить кэш
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Или напрямую
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old ? [...old, newUser] : [newUser]
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name: '...', email: '...' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}
```

### Оптимистичные обновления

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users'] });
    const previous = queryClient.getQueryData(['users']);

    queryClient.setQueryData(['users'], (old) =>
      old.map(u => u.id === newUser.id ? { ...u, ...newUser } : u)
    );

    return { previous }; // context для rollback
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['users'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### Интеграция с Error Boundary

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          <p>Error occurred</p>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

---

## 🔧 OpenAPI и кодогенерация

### Установка

```bash
# openapi-typescript (только типы)
npm install -D openapi-typescript

# orval (React Query хуки + типы)
npm install -D orval
```

### OpenAPI схема (пример)

```yaml
openapi: 3.0.0
paths:
  /api/users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/User' }

components:
  schemas:
    User:
      type: object
      properties:
        id: { type: number }
        name: { type: string }
        email: { type: string }
        role: { type: string, enum: [admin, user] }
```

### Генерация с openapi-typescript

```bash
# Генерация типов
npx openapi-typescript ./openapi.yaml -o ./src/types/api.ts
```

```typescript
// Использование
import { components } from './types/api';

type User = components['schemas']['User'];

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  return res.json();
};
```

### Генерация с orval (React Query)

```bash
# Конфигурация orval.config.ts
export default {
  api: {
    input: './openapi.yaml',
    output: {
      target: './src/api/generated',
      client: 'react-query',
    },
  },
};

# Генерация
npx orval
```

```typescript
// Использование сгенерированных хуков
import { useGetUsers, useCreateUser } from './api/generated/users';

function UserList() {
  const { data, isLoading } = useGetUsers();
  // data типизирован автоматически!

  return <div>{data?.map(u => u.name)}</div>;
}

function CreateUser() {
  const mutation = useCreateUser();

  const handleCreate = () => {
    mutation.mutate({
      name: 'John',
      email: 'john@example.com',
      role: 'user' // enum автоматически!
    });
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Автоматизация

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

### Преимущества

| Преимущество | Описание |
|--------------|----------|
| **Type Safety** | Ошибки API на этапе компиляции |
| **Синхронизация** | Типы всегда соответствуют API |
| **DX** | Автодополнение для всех эндпоинтов |
| **Экономия времени** | Не нужно писать типы вручную |

### Альтернативы

```typescript
// tRPC (для TypeScript fullstack)
const users = trpc.user.list.useQuery();

// GraphQL Code Generator
const { data } = useGetUsersQuery();

// Zodios (Zod + Axios)
const api = new Zodios('/api', [...]);
```

---

## 📋 Таблица сравнения паттернов

| Паттерн | Использование | Пример |
|---------|--------------|--------|
| Custom Hooks | Переиспользование логики с состоянием | `useToggle`, `useDebounce` |
| Compound Components | Гибкие составные UI | `<Card>`, `<Tabs>` |
| Render Props | Разный UI с одной логикой | DataFetcher |
| Context | Избегание prop drilling | Theme, Auth |

## 📋 Оптимизация: когда что использовать

| Инструмент | Когда использовать | Когда НЕ использовать |
|------------|-------------------|----------------------|
| `React.memo` | Дорогой компонент, стабильные props | Props меняются всегда |
| `useMemo` | Дорогие вычисления (циклы, фильтры) | Простые операции |
| `useCallback` | Функция в memo-компоненте | Функция внутри компонента |
| Profiler | Перед оптимизацией | После каждого изменения |

---

## 💡 Best Practices

### Error Boundaries
```typescript
// ✅ Хорошо - на разных уровнях
<ErrorBoundary> {/* App level */}
  <Layout />
  <ErrorBoundary> {/* Widget level */}
    <ComplexWidget />
  </ErrorBoundary>
</ErrorBoundary>

// ❌ Плохо - для flow control
<ErrorBoundary fallback={<Login />}>
  <PrivateRoute />
</ErrorBoundary>
```

### Оптимизация
```typescript
// ✅ Измерить → Оптимизировать → Проверить
// ❌ Оптимизировать всё подряд

// ✅ useMemo для дорогих операций
const filtered = useMemo(() =>
  bigArray.filter(...).sort(...).map(...),
  [bigArray, filter]
);

// ❌ useMemo для простых операций
const sum = useMemo(() => a + b, [a, b]); // НЕ НУЖЕН!
```

### React Query
```typescript
// ✅ Хорошие queryKey
useQuery({ queryKey: ['users', { status: 'active' }], ... });

// ❌ Плохие queryKey
useQuery({ queryKey: ['data'], ... });

// ✅ Централизованные API функции
// api/users.ts
export const usersApi = {
  getAll: () => fetch('/api/users').then(r => r.json()),
  getOne: (id) => fetch(`/api/users/${id}`).then(r => r.json()),
};

// ✅ Обработка всех состояний
if (isLoading) return <Spinner />;
if (isError) return <Error error={error} />;
if (!data) return <Empty />;
return <List data={data} />;
```

---

## 🔧 TypeScript Типы

```typescript
// Error Boundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// React Query
interface User {
  id: number;
  name: string;
  email: string;
}

const { data } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// Custom Hook
function useToggle(initial: boolean = false): {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
} {
  // ...
}
```

---

## 🎓 Памятка

**Паттерны (из LR2):**
- Custom Hooks → логика
- Compound Components → UI композиция
- Render Props → разный UI
- Context → глобальное состояние

**Error Boundaries:**
- Ловят ошибки рендера
- НЕ ловят event handlers, async
- Размещать стратегически

**Оптимизация:**
1. Измерить (Profiler)
2. Найти узкие места
3. Оптимизировать
4. Проверить результат

**React Query:**
- `useQuery` → GET
- `useMutation` → POST/PUT/DELETE
- `queryKey` → кэш
- `invalidateQueries` → обновление

**OpenAPI:**
- OpenAPI схема → описание API
- `openapi-typescript` → только типы
- `orval` → React Query хуки + типы
- Автоматическая синхронизация с backend

---

## 📚 Ресурсы

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [React Performance](https://react.dev/learn/render-and-commit)
- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [orval](https://orval.dev/)
- [Swagger Editor](https://editor.swagger.io/)
