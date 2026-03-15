# Полное руководство: React + TypeScript

## Содержание
1. [Введение](#введение)
2. [Настройка проекта](#настройка-проекта)
3. [Типизация компонентов](#типизация-компонентов)
4. [Работа с хуками](#работа-с-хуками)
5. [Event Handlers](#event-handlers)
6. [Формы и валидация](#формы-и-валидация)
7. [Продвинутые паттерны](#продвинутые-паттерны)
8. [Best Practices](#best-practices)

---

## Введение

TypeScript с React дает нам возможность создавать надежные, масштабируемые приложения с прекрасной поддержкой IDE и автокомплитом.

### Преимущества TypeScript в React:
- **Безопасность типов** - ошибки ловятся на этапе компиляции
- **Лучшая поддержка IDE** - автокомплит, рефакторинг, навигация
- **Документирование через типы** - типы служат живой документацией
- **Рефакторинг** - безопасные изменения кода

---

## Настройка проекта

### Создание нового проекта
```bash
# С помощью Vite
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Основные зависимости
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### Конфигурация TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

---

## Типизация компонентов

### Функциональные компоненты

#### Простой компонент без props
```typescript
import React from 'react';

// Способ 1: Простая функция
function Welcome() {
  return <h1>Добро пожаловать!</h1>;
}

// Способ 2: С явным указанием типа
const Welcome: React.FC = () => {
  return <h1>Добро пожаловать!</h1>;
};

export default Welcome;
```

#### Компонент с props
```typescript
import React from 'react';

// Определение интерфейса для props
interface UserCardProps {
  name: string;
  email: string;
  age?: number; // опциональное свойство
  avatar?: string;
  isOnline: boolean;
}

// Рекомендуемый способ
function UserCard({ name, email, age, avatar, isOnline }: UserCardProps) {
  return (
    <div className={`user-card ${isOnline ? 'online' : 'offline'}`}>
      {avatar && <img src={avatar} alt={`${name} avatar`} />}
      <h2>{name}</h2>
      <p>{email}</p>
      {age && <p>Возраст: {age}</p>}
      <span className="status">
        {isOnline ? '🟢 В сети' : '🔴 Не в сети'}
      </span>
    </div>
  );
}

// Альтернативный способ с React.FC
const UserCardFC: React.FC<UserCardProps> = ({
  name,
  email,
  age,
  avatar,
  isOnline
}) => {
  // тот же JSX...
};

export default UserCard;
```

### Типизация Children

#### ReactNode vs ReactElement

**ReactNode** - самый широкий тип для children:
```typescript
type ReactNode =
  | ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactNode[]
```

**ReactElement** - только JSX элементы:
```typescript
type ReactElement = {
  type: string | ComponentType;
  props: any;
  key: string | number | null;
}
```

**Когда использовать:**

- `ReactNode` - для обычных children (принимает текст, числа, элементы)
- `ReactElement` - когда нужны только JSX элементы (не текст/числа)

```typescript
// ReactNode - принимает всё
interface CardProps {
  children: React.ReactNode; // ✅ "text", 123, <div/>, null
}

// ReactElement - только JSX элементы
interface WrapperProps {
  children: React.ReactElement; // ✅ <div/>, но ✗ "text", 123
}

// Массив элементов
interface TabsProps {
  children: React.ReactElement[]; // только массив JSX элементов
}

// Конкретный тип элемента
interface ModalProps {
  children: React.ReactElement<ButtonProps>; // только Button компоненты
}
```

#### ReactNode для обычных children
```typescript
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode; // принимает любой валидный JSX
  variant?: 'default' | 'outlined' | 'filled';
}

function Card({ title, children, variant = 'default' }: CardProps) {
  return (
    <div className={`card card--${variant}`}>
      <h3 className="card__title">{title}</h3>
      <div className="card__content">
        {children}
      </div>
    </div>
  );
}

// Использование
function App() {
  return (
    <Card title="Мой профиль" variant="outlined">
      <p>Содержимое карточки</p>
      <UserCard name="John" email="john@example.com" isOnline={true} />
    </Card>
  );
}
```

#### Render Props паттерн
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then((data: T) => {
        setData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
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
        if (loading) return <div>Загрузка...</div>;
        if (error) return <div>Ошибка: {error}</div>;
        if (!user) return <div>Пользователь не найден</div>;

        return <UserCard {...user} isOnline={false} />;
      }}
    </DataFetcher>
  );
}
```

---

## Работа с хуками

### useState

#### Примитивные типы
```typescript
import React, { useState } from 'react';

function Counter() {
  // TypeScript автоматически выводит тип
  const [count, setCount] = useState(0); // number
  const [name, setName] = useState(''); // string
  const [isVisible, setVisible] = useState(false); // boolean

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  );
}
```

#### Сложные типы
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

function App() {
  // Явное указание типа для сложных объектов
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Инициализация с начальным значением
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  });

  // Функциональные обновления с типизацией
  const addUser = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setUser(prevUser =>
      prevUser ? { ...prevUser, ...updates } : null
    );
  };

  // Обновление сложного состояния
  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  // JSX...
}
```

### useEffect

```typescript
import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Эффект с async/await
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // пустой массив зависимостей

  // Эффект с зависимостями
  useEffect(() => {
    if (posts.length > 0) {
      document.title = `Постов: ${posts.length}`;
    }

    // Cleanup функция
    return () => {
      document.title = 'React App';
    };
  }, [posts.length]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
}
```

### useReducer

```typescript
import React, { useReducer } from 'react';

// Определение типов состояния и действий
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'completed' | 'active';
  loading: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Union тип для всех возможных действий
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: 'all' | 'completed' | 'active' } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'CLEAR_COMPLETED' };

// Reducer функция с типизацией
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: action.payload.text,
        completed: false,
        createdAt: new Date()
      };
      return {
        ...state,
        todos: [...state.todos, newTodo]
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload.filter
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };

    default:
      return state;
  }
}

// Компонент с useReducer
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    loading: false
  });

  const addTodo = (text: string) => {
    dispatch({ type: 'ADD_TODO', payload: { text } });
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };

  // Фильтрация todos
  const filteredTodos = state.todos.filter(todo => {
    switch (state.filter) {
      case 'completed':
        return todo.completed;
      case 'active':
        return !todo.completed;
      default:
        return true;
    }
  });

  return (
    <div>
      <h1>Todo приложение</h1>
      {/* JSX для UI */}
    </div>
  );
}
```

### useRef

```typescript
import React, { useRef, useEffect } from 'react';

function FocusInput() {
  // Ref для DOM элементов
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Ref для хранения значений
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef(0);

  // Увеличиваем счетчик рендеров
  renderCountRef.current += 1;

  useEffect(() => {
    // Фокус на input при монтировании
    inputRef.current?.focus();

    // Создаем интервал
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    console.log('Form data:', Object.fromEntries(formData));
  };

  return (
    <div>
      <p>Рендеров: {renderCountRef.current}</p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          name="text"
          type="text"
          placeholder="Введите текст"
        />
        <button type="button" onClick={handleFocus}>
          Фокус на input
        </button>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}
```

### useContext

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Типизация контекста
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

// Создание контекста с undefined как значение по умолчанию
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Кастомный хук для использования контекста
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
}

// Props для провайдера
interface ThemeProviderProps {
  children: ReactNode;
}

// Провайдер контекста
function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = {
    primary: theme === 'light' ? '#007bff' : '#0056b3',
    background: theme === 'light' ? '#ffffff' : '#1a1a1a',
    text: theme === 'light' ? '#333333' : '#ffffff'
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Компонент, использующий контекст
function ThemedButton() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: colors.primary,
        color: colors.background,
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Текущая тема: {theme}
    </button>
  );
}

// Главный компонент
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Тематическое приложение</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}
```

---

## Event Handlers

### Основные типы событий

```typescript
import React from 'react';

function EventHandlers() {
  // Click события
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked:', e.currentTarget.textContent);
    e.preventDefault();
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Div clicked at:', e.clientX, e.clientY);
  };

  // Input события
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value:', e.target.value);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Textarea value:', e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected value:', e.target.value);
  };

  // Form события
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');

    // Работа с FormData
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    console.log('Form values:', values);
  };

  // Keyboard события
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Key down:', e.key, e.code);

    // Проверка модификаторов
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Ctrl+S pressed');
    }
  };

  // Mouse события
  const handleMouseEnter = (e: React.MouseEvent) => {
    console.log('Mouse entered');
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    console.log('Mouse left');
  };

  // Focus события
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input focused');
    e.target.select(); // Выделить весь текст
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input blurred, value:', e.target.value);
  };

  return (
    <div>
      <h2>Event Handlers Examples</h2>

      <form onSubmit={handleFormSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
        />

        <textarea
          name="message"
          placeholder="Message"
          onChange={handleTextareaChange}
        />

        <select name="category" onChange={handleSelectChange}>
          <option value="">Выберите категорию</option>
          <option value="tech">Технологии</option>
          <option value="design">Дизайн</option>
          <option value="business">Бизнес</option>
        </select>

        <button type="submit" onClick={handleButtonClick}>
          Отправить
        </button>
      </form>

      <div
        onClick={handleDivClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Кликните по мне!
      </div>
    </div>
  );
}
```

### Передача параметров в обработчики

```typescript
interface Item {
  id: string;
  name: string;
  category: string;
}

function ItemsList() {
  const [items, setItems] = React.useState<Item[]>([
    { id: '1', name: 'Товар 1', category: 'tech' },
    { id: '2', name: 'Товар 2', category: 'design' }
  ]);

  // Способ 1: Через arrow function
  const handleDeleteClick1 = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Способ 2: Currying
  const handleDeleteClick2 = (itemId: string) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // Предотвратить всплытие
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

  // Способ 3: Через data-атрибуты
  const handleDeleteClick3 = (e: React.MouseEvent<HTMLButtonElement>) => {
    const itemId = e.currentTarget.dataset.itemId;
    if (itemId) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleItemClick = (item: Item) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      console.log('Item clicked:', item.name);
    };

  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={handleItemClick(item)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          <h3>{item.name}</h3>
          <p>{item.category}</p>

          {/* Способ 1 */}
          <button onClick={() => handleDeleteClick1(item.id)}>
            Удалить (1)
          </button>

          {/* Способ 2 */}
          <button onClick={handleDeleteClick2(item.id)}>
            Удалить (2)
          </button>

          {/* Способ 3 */}
          <button
            data-item-id={item.id}
            onClick={handleDeleteClick3}
          >
            Удалить (3)
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Формы и валидация

### Контролируемые компоненты

```typescript
import React, { useState } from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  country: string;
  newsletter: boolean;
  gender: 'male' | 'female' | 'other';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
}

function ControlledForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    country: '',
    newsletter: false,
    gender: 'other'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валидация
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.age < 18) {
      newErrors.age = 'Минимальный возраст 18 лет';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчики изменений
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
               type === 'number' ? Number(value) : value
    }));

    // Очистить ошибку для поля
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      gender: e.target.value as 'male' | 'female' | 'other'
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);

      // Сброс формы
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: 0,
        country: '',
        newsletter: false,
        gender: 'other'
      });

      alert('Форма успешно отправлена!');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке формы');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>

      {/* Text Input */}
      <div>
        <label htmlFor="username">Имя пользователя:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.username && <span style={{color: 'red'}}>{errors.username}</span>}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password">Пароль:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword">Подтвердите пароль:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}
      </div>

      {/* Number Input */}
      <div>
        <label htmlFor="age">Возраст:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          disabled={isSubmitting}
          min="0"
          max="120"
        />
        {errors.age && <span style={{color: 'red'}}>{errors.age}</span>}
      </div>

      {/* Select */}
      <div>
        <label htmlFor="country">Страна:</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleSelectChange}
          disabled={isSubmitting}
        >
          <option value="">Выберите страну</option>
          <option value="russia">Россия</option>
          <option value="ukraine">Украина</option>
          <option value="belarus">Беларусь</option>
          <option value="other">Другая</option>
        </select>
      </div>

      {/* Checkbox */}
      <div>
        <label>
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          Подписаться на рассылку
        </label>
      </div>

      {/* Radio Buttons */}
      <div>
        <p>Пол:</p>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formData.gender === 'male'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Мужской
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formData.gender === 'female'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Женский
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={formData.gender === 'other'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Другой
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
```

---

## Продвинутые паттерны

### Compound Components

Compound Components - это паттерн, при котором несколько компонентов работают вместе для создания единого интерфейса. Компоненты "знают" друг о друге и могут совместно использовать состояние.

```typescript
import React, { createContext, useContext, ReactNode } from 'react';

// Простой пример Card с compound components
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
}

interface CardFooterProps {
  children: ReactNode;
}

// Основной компонент Card
function Card({ children, className }: CardProps) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

// Подкомпоненты
const CardHeader = ({ children }: CardHeaderProps) => {
  return <div className="card-header">{children}</div>;
};

const CardContent = ({ children }: CardContentProps) => {
  return <div className="card-content">{children}</div>;
};

const CardFooter = ({ children }: CardFooterProps) => {
  return <div className="card-footer">{children}</div>;
};

// Присоединяем compound components к основному компоненту
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

// Использование
function App() {
  return (
    <Card className="my-card">
      <Card.Header>
        <h2>Заголовок карточки</h2>
      </Card.Header>
      <Card.Content>
        <p>Содержимое карточки</p>
      </Card.Content>
      <Card.Footer>
        <button>Действие</button>
      </Card.Footer>
    </Card>
  );
}
```

#### Пример с совместным состоянием

Вот пример Accordion, где компоненты действительно делят состояние через Context:

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Контекст для состояния аккордеона
interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// Хук для использования контекста
function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion должен использоваться внутри Accordion');
  }
  return context;
}

// Основной компонент Accordion
interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
}

function Accordion({ children, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Подкомпоненты, использующие общее состояние
interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

const AccordionItem = ({ id, children }: AccordionItemProps) => {
  return <div className="accordion-item" data-id={id}>{children}</div>;
};

interface AccordionHeaderProps {
  id: string;
  children: ReactNode;
}

const AccordionHeader = ({ id, children }: AccordionHeaderProps) => {
  const { openItems, toggleItem } = useAccordion();
  const isOpen = openItems.has(id);

  return (
    <button
      className={`accordion-header ${isOpen ? 'open' : ''}`}
      onClick={() => toggleItem(id)}
    >
      {children}
      <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
    </button>
  );
};

interface AccordionContentProps {
  id: string;
  children: ReactNode;
}

const AccordionContent = ({ id, children }: AccordionContentProps) => {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(id);

  if (!isOpen) return null;

  return (
    <div className="accordion-content">
      {children}
    </div>
  );
};

// Присоединяем compound components
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Content = AccordionContent;

// Использование
function App() {
  return (
    <Accordion allowMultiple={true}>
      <Accordion.Item id="item1">
        <Accordion.Header id="item1">Первый раздел</Accordion.Header>
        <Accordion.Content id="item1">
          <p>Содержимое первого раздела</p>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="item2">
        <Accordion.Header id="item2">Второй раздел</Accordion.Header>
        <Accordion.Content id="item2">
          <p>Содержимое второго раздела</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### Generic компоненты

```typescript
import React from 'react';

// Generic Table компонент
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'Нет данных'
}: TableProps<T>) {
  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (data.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={String(column.key)}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map(column => (
              <td key={String(column.key)}>
                {column.render
                  ? column.render(item[column.key], item)
                  : String(item[column.key])
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Использование Generic Table
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

function UsersTable() {
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com', age: 25, isActive: true },
    { id: 2, name: 'Jane', email: 'jane@example.com', age: 30, isActive: false }
  ];

  const columns: Column<User>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    {
      key: 'age',
      label: 'Возраст',
      render: (age) => `${age} лет`
    },
    {
      key: 'isActive',
      label: 'Статус',
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Активен' : 'Неактивен'}
        </span>
      )
    }
  ];

  const handleRowClick = (user: User) => {
    console.log('User clicked:', user.name);
  };

  return (
    <Table
      data={users}
      columns={columns}
      keyExtractor={user => user.id}
      onRowClick={handleRowClick}
    />
  );
}
```

### Higher-Order Components (HOC)

```typescript
import React from 'react';

// HOC для добавления логики загрузки
interface WithLoadingProps {
  isLoading?: boolean;
  loadingComponent?: React.ComponentType;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithLoadingComponent = (props: P & WithLoadingProps) => {
    const { isLoading, loadingComponent: LoadingComponent, ...restProps } = props;

    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <div>Загрузка...</div>;
    }

    return <WrappedComponent {...(restProps as P)} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLoadingComponent;
}

// HOC для обработки ошибок
interface WithErrorHandlingProps {
  error?: string | null;
  onErrorRetry?: () => void;
}

function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithErrorHandlingComponent = (props: P & WithErrorHandlingProps) => {
    const { error, onErrorRetry, ...restProps } = props;

    if (error) {
      return (
        <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
          <h3>Произошла ошибка:</h3>
          <p>{error}</p>
          {onErrorRetry && (
            <button onClick={onErrorRetry}>Повторить</button>
          )}
        </div>
      );
    }

    return <WrappedComponent {...(restProps as P)} />;
  };

  WithErrorHandlingComponent.displayName = `withErrorHandling(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorHandlingComponent;
}

// Композиция HOC
const withLoadingAndErrorHandling = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return withLoading(withErrorHandling(WrappedComponent));
};

// Базовый компонент
interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name} - {user.email}</li>
    ))}
  </ul>
);

// Компонент с HOC
const EnhancedUserList = withLoadingAndErrorHandling(UserList);

// Использование
function App() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUsers([
        { id: 1, name: 'John', email: 'john@example.com', age: 25, isActive: true }
      ]);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Пользователи</h1>
      <EnhancedUserList
        users={users}
        isLoading={loading}
        error={error}
        onErrorRetry={fetchUsers}
      />
    </div>
  );
}
```

### Кастомные хуки

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

// Хук для работы с localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Хук для debounced значений
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для предыдущего значения
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Хук для toggle состояния
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse] as const;
}

// Хук для работы с API
interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

function useApi<T>(url: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { immediate = true, onSuccess, onError } = options;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: T = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Хук для intersection observer
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Примеры использования кастомных хуков
function CustomHooksExample() {
  // localStorage хук
  const [name, setName, removeName] = useLocalStorage('userName', '');

  // Toggle хук
  const [isVisible, toggleVisible, showElement, hideElement] = useToggle(false);

  // Debounce хук
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Previous value хук
  const previousSearchTerm = usePrevious(debouncedSearchTerm);

  // API хук
  const { data: users, loading, error, execute: refetchUsers } = useApi<User[]>(
    '/api/users',
    {
      onSuccess: (data) => console.log('Users loaded:', data.length),
      onError: (error) => console.error('Failed to load users:', error)
    }
  );

  // Intersection observer хук
  const elementRef = useRef<HTMLDivElement>(null);
  const isElementVisible = useIntersectionObserver(elementRef, {
    threshold: 0.5
  });

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm !== previousSearchTerm) {
      console.log('Searching for:', debouncedSearchTerm);
      // Выполнить поиск
    }
  }, [debouncedSearchTerm, previousSearchTerm]);

  return (
    <div>
      <h2>Кастомные хуки в действии</h2>

      {/* localStorage */}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите имя"
        />
        <button onClick={removeName}>Очистить имя</button>
        <p>Сохраненное имя: {name}</p>
      </div>

      {/* Toggle */}
      <div>
        <button onClick={toggleVisible}>
          {isVisible ? 'Скрыть' : 'Показать'} элемент
        </button>
        <button onClick={showElement}>Показать</button>
        <button onClick={hideElement}>Скрыть</button>
        {isVisible && <p>Этот элемент видимый!</p>}
      </div>

      {/* Debounce search */}
      <div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск с задержкой"
        />
        <p>Поисковый запрос: {debouncedSearchTerm}</p>
        {previousSearchTerm && (
          <p>Предыдущий запрос: {previousSearchTerm}</p>
        )}
      </div>

      {/* API data */}
      <div>
        <button onClick={refetchUsers}>Обновить пользователей</button>
        {loading && <p>Загрузка...</p>}
        {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}
        {users && <p>Пользователей загружено: {users.length}</p>}
      </div>

      {/* Intersection observer */}
      <div style={{ height: '1000px' }}>
        <p>Прокрутите вниз...</p>
      </div>
      <div
        ref={elementRef}
        style={{
          height: '200px',
          backgroundColor: isElementVisible ? 'lightgreen' : 'lightcoral',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isElementVisible ? 'Элемент видим!' : 'Элемент не видим'}
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Структура проекта
```
src/
├── components/           # Переиспользуемые компоненты
│   ├── ui/              # Базовые UI компоненты
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   └── Input/
│   └── common/          # Общие компоненты
├── hooks/               # Кастомные хуки
├── types/               # Типы TypeScript
├── utils/               # Утилиты
├── pages/               # Страницы
└── contexts/            # React контексты
```

### 2. Именование типов и интерфейсов
```typescript
// ✅ Хорошо
interface UserProps {
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type Theme = 'light' | 'dark';
type Status = 'loading' | 'success' | 'error';

// ❌ Плохо
interface IUser {  // Не используйте префикс I
  name: string;
}

interface userProps {  // Используйте PascalCase
  name: string;
}
```

### 3. Типизация props
```typescript
// ✅ Хорошо - отдельный интерфейс
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ variant, size, disabled, onClick, children }: ButtonProps) {
  // ...
}

// ✅ Хорошо - наследование от HTML атрибутов
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, ...inputProps }: InputProps) {
  // ...
}
```

### 4. Избегайте any
```typescript
// ❌ Плохо
function processData(data: any) {
  return data.someProperty;
}

// ✅ Хорошо
interface DataType {
  someProperty: string;
  anotherProperty: number;
}

function processData(data: DataType) {
  return data.someProperty;
}

// ✅ Хорошо - unknown для неизвестных данных
function processUnknownData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as DataType).someProperty;
  }
  throw new Error('Invalid data format');
}
```

### 5. Используйте union типы для состояний
```typescript
// ✅ Хорошо
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const execute = async () => {
    setState({ status: 'loading' });

    try {
      const data = await fetcher();
      setState({ status: 'success', data });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return { state, execute };
}
```

### 6. Константы и enums
```typescript
// ✅ Хорошо - const assertions
const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

type Theme = typeof THEME[keyof typeof THEME];

// ✅ Хорошо - string enums
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// ✅ Хорошо - union типы для небольших наборов
type ButtonSize = 'small' | 'medium' | 'large';
```

### 7. Обработка ошибок
```typescript
// ✅ Хорошо
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch user: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}
```

### 8. Мемоизация и оптимизация
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  filter: string;
}

// Мемоизация компонента
const ExpensiveList = memo<ExpensiveListProps>(({
  items,
  onItemClick,
  filter
}) => {
  // Мемоизация вычислений
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // Мемоизация функций
  const handleItemClick = useCallback((item: Item) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <ul>
      {filteredItems.map(item => (
        <ExpensiveListItem
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </ul>
  );
});

// Сравнение props для memo
const ExpensiveListItem = memo<{
  item: Item;
  onClick: (item: Item) => void;
}>(({ item, onClick }) => {
  return (
    <li onClick={() => onClick(item)}>
      {item.name}
    </li>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.name === nextProps.item.name;
});
```

---

## Заключение

React + TypeScript предоставляет мощные инструменты для создания надежных, типобезопасных приложений. Основные принципы:

1. **Используйте строгую типизацию** - избегайте `any`
2. **Создавайте четкие интерфейсы** для props и состояния
3. **Применяйте правильные паттерны** для различных сценариев
4. **Оптимизируйте производительность** с помощью мемоизации
5. **Следуйте соглашениям** по именованию и структуре

Регулярная практика и изучение современных паттернов поможет вам максимально эффективно использовать возможности TypeScript в React приложениях.