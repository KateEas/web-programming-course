# Шпаргалка: MobX + Zustand

## Быстрый справочник по state management

### 📋 Содержание
- [MobX Basics](#mobx-basics)
- [MobX с React](#mobx-с-react)
- [MobX Computed](#mobx-computed)
- [MobX Actions](#mobx-actions)
- [Zustand Basics](#zustand-basics)
- [Zustand Middleware](#zustand-middleware)
- [Zustand TypeScript](#zustand-typescript)
- [Когда что использовать](#когда-что-использовать)

---

## MobX Basics

### Установка

```bash
npm install mobx mobx-react-lite
```

### Observable State

```typescript
import { makeObservable, observable, action } from 'mobx'

class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeObservable(this, {
      todos: observable,
      addTodo: action,
    })
  }

  addTodo(text: string) {
    this.todos.push({ id: Date.now(), text, done: false })
  }
}
```

### makeAutoObservable (рекомендуется)

```typescript
import { makeAutoObservable } from 'mobx'

class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this) // Автоматически делает всё observable
  }

  addTodo(text: string) {
    this.todos.push({ id: Date.now(), text, done: false })
  }

  get completedCount() {
    return this.todos.filter(t => t.done).length
  }
}
```

---

## MobX с React

### Observer Hook

```typescript
import { observer } from 'mobx-react-lite'

const TodoList = observer(() => {
  const store = useTodoStore()

  return (
    <div>
      {store.todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  )
})
```

### Observer HOC

```typescript
import { observer } from 'mobx-react-lite'

class TodoListClass extends React.Component {
  render() {
    const { store } = this.props
    return <div>{/* ... */}</div>
  }
}

export default observer(TodoListClass)
```

### React Context + MobX

```typescript
// stores/context.ts
import { createContext, useContext } from 'react'

const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider = StoreContext.Provider

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be within StoreProvider')
  return store
}

// App.tsx
import { StoreProvider } from './stores/context'
import { rootStore } from './stores/RootStore'

function App() {
  return (
    <StoreProvider value={rootStore}>
      <TodoList />
    </StoreProvider>
  )
}
```

---

## MobX Computed

### Computed Values

```typescript
import { makeAutoObservable, computed } from 'mobx'

class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  get completedTodos() {
    return this.todos.filter(t => t.done)
  }

  get activeTodos() {
    return this.todos.filter(t => !t.done)
  }

  get stats() {
    return {
      total: this.todos.length,
      completed: this.completedTodos.length,
      active: this.activeTodos.length,
    }
  }
}
```

### Computed with Arguments

```typescript
class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  getTodosByCategory(category: string) {
    // ❌ НЕ computed - аргументы
    return this.todos.filter(t => t.category === category)
  }

  // ✅ Используйте Map для кэширования
  get todosByCategory() {
    const map = new Map<string, Todo[]>()
    this.todos.forEach(todo => {
      const existing = map.get(todo.category) || []
      map.set(todo.category, [...existing, todo])
    })
    return map
  }
}
```

---

## MobX Actions

### Обычные Actions

```typescript
class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  addTodo(text: string) {
    this.todos.push({ id: Date.now(), text, done: false })
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(t => t.id !== id)
  }

  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) todo.done = !todo.done
  }
}
```

### Async Actions

```typescript
import { runInAction } from 'mobx'

class TodoStore {
  todos: Todo[] = []
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchTodos() {
    this.loading = true
    this.error = null

    try {
      const response = await fetch('/api/todos')
      const data = await response.json()

      runInAction(() => {
        this.todos = data
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message
        this.loading = false
      })
    }
  }
}
```

### Flow (альтернатива async/await)

```typescript
import { flow } from 'mobx'

class TodoStore {
  todos: Todo[] = []
  loading = false

  constructor() {
    makeAutoObservable(this, {
      fetchTodos: flow, // Указываем что это flow
    })
  }

  *fetchTodos() {
    this.loading = true
    try {
      const response = yield fetch('/api/todos')
      const data = yield response.json()
      this.todos = data
    } finally {
      this.loading = false
    }
  }
}
```

---

## Zustand Basics

### Установка

```bash
npm install zustand
```

### Простой Store

```typescript
import { create } from 'zustand'

interface BearStore {
  bears: number
  increase: () => void
  decrease: () => void
  reset: () => void
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
  reset: () => set({ bears: 0 }),
}))

// Использование
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <div>Bears: {bears}</div>
}

function Controls() {
  const increase = useBearStore((state) => state.increase)
  return <button onClick={increase}>+1</button>
}
```

### Async Actions

```typescript
interface TodoStore {
  todos: Todo[]
  loading: boolean
  fetchTodos: () => Promise<void>
}

const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/todos')
      const todos = await response.json()
      set({ todos, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },
}))
```

### Доступ вне React

```typescript
// Получить текущее состояние
const currentState = useBearStore.getState()
console.log(currentState.bears)

// Изменить состояние
useBearStore.setState({ bears: 10 })

// Подписаться на изменения
const unsubscribe = useBearStore.subscribe(
  (state) => console.log('Bears changed:', state.bears)
)
```

---

## Zustand Middleware

### Persist (сохранение в localStorage)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'user-storage', // ключ в localStorage
    }
  )
)
```

### Immer (иммутабельность)

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],

    addTodo: (text) => set((state) => {
      // Можно мутировать напрямую!
      state.todos.push({ id: Date.now(), text, done: false })
    }),

    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find(t => t.id === id)
      if (todo) todo.done = !todo.done
    }),
  }))
)
```

### DevTools

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create<Store>()(
  devtools(
    (set) => ({
      count: 0,
      increase: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'MyStore' }
  )
)
```

### Комбинирование middleware

```typescript
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create<Store>()(
  devtools(
    persist(
      immer((set) => ({
        // store implementation
      })),
      { name: 'my-storage' }
    ),
    { name: 'MyStore' }
  )
)
```

---

## Zustand TypeScript

### Типизация Store

```typescript
interface Todo {
  id: number
  text: string
  done: boolean
}

interface TodoStore {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'

  // Actions
  addTodo: (text: string) => void
  removeTodo: (id: number) => void
  toggleTodo: (id: number) => void
  setFilter: (filter: TodoStore['filter']) => void

  // Computed
  filteredTodos: () => Todo[]
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  filter: 'all',

  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),

  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter(t => t.id !== id)
  })),

  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    )
  })),

  setFilter: (filter) => set({ filter }),

  filteredTodos: () => {
    const { todos, filter } = get()
    switch (filter) {
      case 'active': return todos.filter(t => !t.done)
      case 'completed': return todos.filter(t => t.done)
      default: return todos
    }
  },
}))
```

### Селекторы с типами

```typescript
// ✅ Хорошо - типизированный селектор
const bears = useBearStore((state) => state.bears)

// ✅ Хорошо - несколько полей
const { bears, increase } = useBearStore((state) => ({
  bears: state.bears,
  increase: state.increase,
}))

// ✅ Хорошо - shallow comparison
import { shallow } from 'zustand/shallow'

const { bears, increase } = useBearStore(
  (state) => ({ bears: state.bears, increase: state.increase }),
  shallow
)
```

---

## Когда что использовать

### MobX - Используйте для:

✅ **Сложная бизнес-логика**
- Domain модели с методами
- Вычисляемые значения (computed)
- Связанные данные (relations)

✅ **Объектно-ориентированный подход**
- Классы с инкапсуляцией
- Наследование stores
- Приватные методы

✅ **Автоматическая оптимизация**
- MobX автоматически отслеживает зависимости
- Только нужные компоненты перерисовываются

**Пример: E-commerce cart**
```typescript
class CartStore {
  items: CartItem[] = []

  constructor() {
    makeAutoObservable(this)
  }

  get total() {
    return this.items.reduce((sum, item) =>
      sum + item.price * item.quantity, 0
    )
  }

  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  addItem(product: Product, quantity: number) {
    const existing = this.items.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      this.items.push({ productId: product.id, quantity, price: product.price })
    }
  }
}
```

### Zustand - Используйте для:

✅ **Простое глобальное состояние**
- UI состояние (модалки, темы)
- Пользовательские настройки
- Флаги и переключатели

✅ **Функциональный подход**
- Иммутабельные обновления
- Простые селекторы
- Middleware (persist, devtools)

✅ **Легковесные решения**
- Маленький bundle size (~1KB)
- Без decorators
- Простой API

**Пример: UI состояние**
```typescript
interface UIStore {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  modalOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  openModal: () => void
  closeModal: () => void
}

const useUIStore = create<UIStore>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  modalOpen: false,

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),

  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}))
```

### Комбинирование MobX + Zustand

```typescript
// MobX для бизнес-логики
class UserStore {
  user: User | null = null
  loading = false

  constructor() {
    makeAutoObservable(this)
  }

  async login(email: string, password: string) {
    this.loading = true
    try {
      const user = await api.login(email, password)
      this.user = user
    } finally {
      this.loading = false
    }
  }

  get isAuthenticated() {
    return this.user !== null
  }
}

// Zustand для UI состояния
const useUIStore = create<UIStore>((set) => ({
  theme: 'light',
  notifications: [],
  addNotification: (message) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), message }]
  })),
}))

// В компоненте
function App() {
  const userStore = useUserStore()
  const theme = useUIStore((state) => state.theme)

  return (
    <div className={theme}>
      {userStore.isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  )
}
```

---

## ⚡ Быстрые команды

### MobX Setup

```bash
npm install mobx mobx-react-lite
```

```typescript
// store.ts
import { makeAutoObservable } from 'mobx'

class Store {
  value = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.value++
  }
}

export const store = new Store()
```

```typescript
// Component.tsx
import { observer } from 'mobx-react-lite'
import { store } from './store'

export const Counter = observer(() => {
  return (
    <div>
      <p>{store.value}</p>
      <button onClick={() => store.increment()}>+</button>
    </div>
  )
})
```

### Zustand Setup

```bash
npm install zustand
```

```typescript
// store.ts
import { create } from 'zustand'

interface Store {
  value: number
  increment: () => void
}

export const useStore = create<Store>((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}))
```

```typescript
// Component.tsx
import { useStore } from './store'

export function Counter() {
  const { value, increment } = useStore()

  return (
    <div>
      <p>{value}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

---

## 🚨 Частые ошибки

### MobX

#### ❌ Мутация без action

```typescript
// ❌ Плохо
class Store {
  value = 0

  constructor() {
    makeObservable(this, { value: observable })
  }
}

// В компоненте
store.value++ // Ошибка в strict mode!
```

```typescript
// ✅ Хорошо
class Store {
  value = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.value++
  }
}

store.increment() // Правильно
```

#### ❌ Забыли observer

```typescript
// ❌ Компонент не обновится!
function Counter() {
  return <div>{store.value}</div>
}

// ✅ Обернули в observer
const Counter = observer(() => {
  return <div>{store.value}</div>
})
```

### Zustand

#### ❌ Мутация state напрямую

```typescript
// ❌ Плохо
const useStore = create<Store>((set) => ({
  items: [],
  addItem: (item) => {
    useStore.getState().items.push(item) // Мутация!
  },
}))

// ✅ Хорошо
const useStore = create<Store>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item] // Новый массив
  })),
}))
```

#### ❌ Лишние ре-рендеры

```typescript
// ❌ Подписка на весь store
const store = useStore()
// Компонент обновится при любом изменении!

// ✅ Подписка только на нужные поля
const value = useStore((state) => state.value)
// Обновится только при изменении value
```

---

## 📚 Полезные ресурсы

### MobX
- [MobX Documentation](https://mobx.js.org/)
- [MobX React](https://mobx.js.org/react-integration.html)
- [MobX State Tree](https://mobx-state-tree.js.org/) (для сложных случаев)

### Zustand
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Examples](https://docs.pmnd.rs/zustand/guides/typescript)
