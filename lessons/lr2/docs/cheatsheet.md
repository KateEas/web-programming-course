# Шпаргалка: React + TypeScript

## Быстрый справочник по React с TypeScript

### 📋 Содержание
- [Базовые типы](#базовые-типы)
- [Типизация компонентов](#типизация-компонентов)
- [Хуки](#хуки)
- [Event Handlers](#event-handlers)
- [Формы](#формы)
- [Refs](#refs)
- [Контекст](#контекст)
- [Продвинутые типы](#продвинутые-типы)

---

## Базовые типы

### React типы
```typescript
import React from 'react';

// Основные React типы
React.ReactNode        // Любой рендерируемый контент
React.ReactElement     // JSX элемент
React.ComponentType    // Тип компонента
React.FC              // Functional Component (необязательно)
React.Component       // Class Component

// JSX типы
JSX.Element           // Результат JSX выражения
JSX.IntrinsicElements // HTML элементы
```

### HTML типы
```typescript
// HTML элементы
HTMLDivElement
HTMLInputElement
HTMLButtonElement
HTMLFormElement
HTMLSelectElement
HTMLTextAreaElement

// HTML атрибуты
React.HTMLProps<HTMLDivElement>
React.InputHTMLAttributes<HTMLInputElement>
React.ButtonHTMLAttributes<HTMLButtonElement>
React.FormHTMLAttributes<HTMLFormElement>
```

---

## Типизация компонентов

### Функциональные компоненты

```typescript
// ✅ Рекомендуемый способ
interface Props {
  name: string;
  age?: number;
}

function MyComponent({ name, age }: Props) {
  return <div>Hello {name}</div>;
}

// ✅ Альтернативный способ
const MyComponent: React.FC<Props> = ({ name, age }) => {
  return <div>Hello {name}</div>;
};
```

### Props с children
```typescript
// Простые children
interface Props {
  children: React.ReactNode;
}

// Render prop
interface Props {
  children: (data: User) => React.ReactNode;
}

// Ограниченные children
interface Props {
  children: React.ReactElement<ButtonProps>;
}
```

### Расширение HTML атрибутов
```typescript
// Кнопка с дополнительными props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
  loading?: boolean;
}

// Input с лейблом
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
```

---

## Хуки

### useState
```typescript
// Простые типы (автовывод)
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('');           // string
const [visible, setVisible] = useState(false);  // boolean

// Сложные типы
const [user, setUser] = useState<User | null>(null);
const [users, setUsers] = useState<User[]>([]);

// С начальным значением
const [state, setState] = useState<State>({
  loading: false,
  error: null,
  data: []
});
```

### useEffect
```typescript
useEffect(() => {
  // Синхронная функция
  fetchData();

  // Cleanup
  return () => {
    cleanup();
  };
}, [dependency]); // типизация зависимостей автоматическая

// Async эффект
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/data');
    const data: ApiResponse = await response.json();
    setData(data);
  };

  fetchData();
}, []);
```

### useReducer
```typescript
// Типы состояния и действий
type State = {
  count: number;
  error: string | null;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set_error'; payload: string };

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'set_error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Использование
const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
```

### useRef
```typescript
// DOM элементы
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Изменяемые значения
const countRef = useRef<number>(0);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Доступ к ref
inputRef.current?.focus();
```

### useContext
```typescript
// Создание контекста
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Хук для использования контекста
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## Event Handlers

### Базовые события
```typescript
// Click события
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.textContent);
};

const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log('Clicked at:', e.clientX, e.clientY);
};

// Input события
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setText(e.target.value);
};

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelected(e.target.value);
};

// Form события
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
};

// Keyboard события
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
};

// Focus события
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log('Input focused');
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log('Input blurred');
};
```

### Передача параметров
```typescript
// Через arrow function
<button onClick={() => handleDelete(item.id)}>Delete</button>

// Через currying
const handleDelete = (id: string) => (e: React.MouseEvent) => {
  e.stopPropagation();
  deleteItem(id);
};

// Через data-атрибуты
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  const id = e.currentTarget.dataset.id;
  if (id) deleteItem(id);
};

<button data-id={item.id} onClick={handleClick}>Delete</button>
```

---

## Формы

### Контролируемые компоненты
```typescript
interface FormData {
  username: string;
  email: string;
  age: number;
  country: string;
  subscribe: boolean;
}

const [formData, setFormData] = useState<FormData>({
  username: '',
  email: '',
  age: 0,
  country: '',
  subscribe: false
});

// Универсальный обработчик
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  const checked = (e.target as HTMLInputElement).checked;

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked :
             type === 'number' ? Number(value) : value
  }));
};
```

### Валидация
```typescript
interface FormErrors {
  username?: string;
  email?: string;
}

const [errors, setErrors] = useState<FormErrors>({});

const validateForm = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  }

  if (!formData.email.includes('@')) {
    newErrors.email = 'Invalid email';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## Refs

### useRef
```typescript
// DOM refs
const inputRef = useRef<HTMLInputElement>(null);

// Доступ к элементу
const focusInput = () => {
  inputRef.current?.focus();
};

// Refs для значений
const renderCount = useRef(0);
renderCount.current += 1;
```

### forwardRef
```typescript
interface InputProps {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )
);

// Использование
const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return <Input ref={inputRef} label="Name" />;
};
```

---

## Контекст

### Создание контекста
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

### Провайдер
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Кастомный хук
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Продвинутые типы

### Generic компоненты
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Использование
<List
  items={users}
  keyExtractor={user => user.id}
  renderItem={user => <span>{user.name}</span>}
/>
```

### Utility Types
```typescript
// Pick - выбрать определенные поля
type UserFormData = Pick<User, 'name' | 'email'>;

// Omit - исключить определенные поля
type CreateUser = Omit<User, 'id' | 'createdAt'>;

// Partial - сделать все поля опциональными
type UserUpdate = Partial<User>;

// Required - сделать все поля обязательными
type CompleteUser = Required<User>;

// Record - создать объект с определенными ключами
type UserRoles = Record<string, 'admin' | 'user'>;
```

### Union типы для состояний
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const [state, setState] = useState<AsyncState<User[]>>({ status: 'idle' });

// Type guard
const isSuccess = (state: AsyncState<any>): state is { status: 'success'; data: any } => {
  return state.status === 'success';
};

if (isSuccess(state)) {
  console.log(state.data); // TypeScript знает что data существует
}
```

### HOC типизация
```typescript
interface WithLoadingProps {
  loading?: boolean;
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P & WithLoadingProps) => {
    const { loading, ...restProps } = props;

    if (loading) {
      return <div>Loading...</div>;
    }

    return <Component {...(restProps as P)} />;
  };
}
```

---

## ⚡ Быстрые команды

### Создание компонента
```typescript
// Шаблон функционального компонента
interface Props {
  // определить props
}

export const ComponentName = ({ }: Props) => {
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Создание хука
```typescript
// Шаблон кастомного хука
export const useCustomHook = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  // логика хука

  return { value, setValue };
};
```

### Создание контекста
```typescript
// Шаблон контекста
interface ContextType {
  // определить типы
}

const Context = createContext<ContextType | undefined>(undefined);

export const useContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
};
```

---

## 🚨 Частые ошибки

### ❌ Что НЕ нужно делать
```typescript
// Не используйте any
const handleClick = (e: any) => { };

// Не используйте React.FC без необходимости
const Component: React.FC = () => { };

// Не мутируйте состояние
state.users.push(newUser);

// Не забывайте dependencies в useEffect
useEffect(() => {
  fetchData(userId);
}, []); // userId должен быть в зависимостях
```

### ✅ Что нужно делать
```typescript
// Используйте точные типы
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };

// Простые функции
const Component = () => { };

// Иммутабельные обновления
setUsers(prev => [...prev, newUser]);

// Правильные зависимости
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

---

## 📚 Полезные ресурсы

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Playground](https://www.typescriptlang.org/play)