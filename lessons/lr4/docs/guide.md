# Полное руководство: Управление состоянием с MobX и Zustand

## Содержание
1. [Введение в управление состоянием](#введение)
2. [MobX: Реактивное программирование](#mobx)
3. [Zustand: Минималистичное решение](#zustand)
4. [Сравнение и выбор подхода](#сравнение)
5. [Интеграция с TypeScript](#typescript)
6. [Продвинутые паттерны](#advanced)
7. [Best Practices](#best-practices)

---

## Введение в управление состоянием {#введение}

### Зачем нужно управление состоянием?

В React-приложениях состояние (state) — это данные, которые определяют, что показывать пользователю. По мере роста приложения возникают проблемы:

1. **Prop drilling** — передача данных через множество компонентов
2. **Дублирование состояния** — одни и те же данные в разных местах
3. **Синхронизация** — сложность обновления связанных данных
4. **Производительность** — лишние ре-рендеры компонентов

### Эволюция решений

```
Local State (useState)
   ↓
Context API (useContext)
   ↓
Redux (действия, редьюсеры)
   ↓
MobX / Zustand (современные решения)
```

### Когда использовать библиотеки управления состоянием?

**Используйте**, если:
- Состояние нужно в многих компонентах
- Сложная бизнес-логика
- Нужно кэшировать серверные данные
- Состояние должно переживать навигацию

**Не используйте**, если:
- Простые формы
- Локальное UI-состояние (модалки, табы)
- Мало компонентов

---

## MobX: Реактивное программирование {#mobx}

### Философия MobX

MobX делает управление состоянием простым, применяя **реактивное программирование**:

```
State → Derivations → Reactions
```

- **State** (состояние) — данные приложения
- **Derivations** (производные) — вычисляемые значения
- **Reactions** — побочные эффекты (например, обновление UI)

### Основные концепции

#### 1. Observable State (Наблюдаемое состояние)

```typescript
import { makeObservable, observable, action } from 'mobx';

class TodoStore {
  todos: string[] = [];

  constructor() {
    makeObservable(this, {
      todos: observable,
      addTodo: action,
    });
  }

  addTodo(text: string) {
    this.todos.push(text);
  }
}
```

**Что происходит:**
- `observable` — MobX отслеживает изменения массива `todos`
- `action` — метод, который может изменять состояние
- При изменении `todos` все зависимые компоненты обновятся

#### 2. makeAutoObservable — упрощённый вариант

```typescript
import { makeAutoObservable } from 'mobx';

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this); // Автоматически делает всё observable
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}
```

**Преимущества:**
- Не нужно перечислять каждое поле
- Методы автоматически становятся actions
- Меньше boilerplate-кода

#### 3. Computed Values (Вычисляемые значения)

```typescript
import { makeAutoObservable, computed } from 'mobx';

class CartStore {
  items = [
    { name: 'Книга', price: 500, quantity: 2 },
    { name: 'Ручка', price: 50, quantity: 5 },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  get total() {
    return this.items.reduce((sum, item) =>
      sum + item.price * item.quantity, 0
    );
  }

  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

// Использование
const cart = new CartStore();
console.log(cart.total); // 1250
console.log(cart.itemCount); // 7
```

**Computed values:**
- Вычисляются **автоматически** при изменении зависимостей
- **Кэшируются** — пересчёт только при изменении данных
- **Чистые функции** — нет побочных эффектов

#### 4. Actions — изменение состояния

```typescript
class TodoStore {
  todos: Todo[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(text: string) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}
```

**Правила actions:**
- Все изменения состояния — только через actions
- Actions могут быть синхронными и асинхронными
- Можно вызывать другие actions

### Интеграция с React

#### observer — HOC и хук

```typescript
import { observer } from 'mobx-react-lite';

// Вариант 1: observer как HOC
const TodoList = observer(({ store }: { store: TodoStore }) => {
  return (
    <div>
      <h2>Задачи: {store.todos.length}</h2>
      {store.todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => store.toggleTodo(todo.id)}
          />
          {todo.text}
        </div>
      ))}
    </div>
  );
});

// Вариант 2: observer как хук
function TodoList({ store }: { store: TodoStore }) {
  return useObserver(() => (
    <div>
      <h2>Задачи: {store.todos.length}</h2>
      {/* ... */}
    </div>
  ));
}
```

**Важно:**
- Компонент **автоматически** обновляется при изменении используемых observable-полей
- Обновляются **только** компоненты, которые читают изменённые данные
- Никаких `setState` или `dispatch` не нужно

#### React Context для передачи store

```typescript
import React, { createContext, useContext } from 'react';

const TodoStoreContext = createContext<TodoStore | null>(null);

export const TodoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = new TodoStore();
  return (
    <TodoStoreContext.Provider value={store}>
      {children}
    </TodoStoreContext.Provider>
  );
};

export const useTodoStore = () => {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider');
  }
  return store;
};

// Использование в компоненте
const TodoApp = observer(() => {
  const store = useTodoStore();
  return <div>{store.todos.length} задач</div>;
});
```

### Async Actions (Асинхронные действия)

#### runInAction для обновления после async/await

```typescript
import { runInAction, makeAutoObservable } from 'mobx';

class UserStore {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUsers() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      runInAction(() => {
        this.users = data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.loading = false;
      });
    }
  }
}
```

**Почему runInAction?**
- Код после `await` выполняется **вне** action
- `runInAction` оборачивает обновления в action
- Альтернатива — использовать `flow` (генераторы)

#### flow — альтернатива async/await

```typescript
import { flow, makeAutoObservable } from 'mobx';

class UserStore {
  users: User[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this, {
      fetchUsers: flow, // Указываем, что это flow
    });
  }

  *fetchUsers() { // Генератор
    this.loading = true;
    try {
      const response = yield fetch('/api/users');
      const data = yield response.json();
      this.users = data;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}

// Использование
store.fetchUsers(); // Вызывается как обычная функция
```

**flow vs runInAction:**
- `flow` — не нужны `runInAction`-обёртки
- `runInAction` — привычный async/await синтаксис
- Выбирайте, что удобнее

### Reactions (Реакции)

Reactions — код, который выполняется **автоматически** при изменении observable:

```typescript
import { reaction, autorun, when } from 'mobx';

class LogStore {
  logs: string[] = [];

  constructor() {
    makeAutoObservable(this);

    // autorun — выполняется сразу и при каждом изменении
    autorun(() => {
      console.log(`Всего логов: ${this.logs.length}`);
    });

    // reaction — выполняется только при изменении отслеживаемого значения
    reaction(
      () => this.logs.length,
      (length) => {
        if (length > 100) {
          console.warn('Слишком много логов!');
        }
      }
    );

    // when — выполняется один раз, когда условие станет true
    when(
      () => this.logs.length >= 10,
      () => {
        console.log('Достигнуто 10 логов');
      }
    );
  }

  addLog(message: string) {
    this.logs.push(message);
  }
}
```

**Когда использовать reactions:**
- Синхронизация с localStorage
- Логирование
- Аналитика
- Автосохранение

---

## Zustand: Минималистичное решение {#zustand}

### Философия Zustand

Zustand (нем. "состояние") — **минималистичная** библиотека управления состоянием:

- **Простой API** — один хук `create`
- **Без провайдеров** — состояние вне React-дерева
- **TypeScript-first** — отличная типизация из коробки
- **Middleware** — расширяемость через плагины

### Создание Store

```typescript
import { create } from 'zustand';

interface BearStore {
  bears: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
  reset: () => set({ bears: 0 }),
}));

// Использование в компоненте
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <h1>{bears} медведей</h1>
      <button onClick={increase}>Добавить</button>
    </div>
  );
}
```

**Что происходит:**
- `create` создаёт хук для доступа к состоянию
- `set` — функция для обновления состояния
- Селектор `(state) => state.bears` — компонент подписывается только на `bears`

### Selectors (Селекторы)

#### Базовые селекторы

```typescript
interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
}

const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    )
  })),
}));

// Компонент подписывается только на todos
function TodoList() {
  const todos = useTodoStore((state) => state.todos);

  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

// Компонент подписывается только на addTodo
function AddTodoForm() {
  const addTodo = useTodoStore((state) => state.addTodo);
  const [text, setText] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      addTodo(text);
      setText('');
    }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Добавить</button>
    </form>
  );
}
```

#### Computed Selectors

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));

// Вычисляемые значения через селекторы
function CartSummary() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <div>
      <p>Товаров: {itemCount}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

**Проблема:** селектор пересчитывается при каждом рендере

**Решение:** используйте `shallow` или `useShallow`

```typescript
import { shallow } from 'zustand/shallow';

function CartSummary() {
  const { total, itemCount } = useCartStore(
    (state) => ({
      total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    shallow // Сравнивает объект по значениям, а не по ссылке
  );

  return (
    <div>
      <p>Товаров: {itemCount}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

### Async Actions

```typescript
interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      set({ users, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      });
    }
  },
}));

// Использование
function UserList() {
  const { users, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Middleware

Zustand поддерживает middleware для расширения функциональности.

#### persist — сохранение в localStorage

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ru',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings', // Ключ в localStorage
    }
  )
);
```

**Что происходит:**
- При изменении состояния — автосохранение в `localStorage`
- При загрузке страницы — автоматическое восстановление
- Поддержка сериализации/десериализации

#### immer — удобные мутации

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
}

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],

    addTodo: (text) => set((state) => {
      // Можно напрямую мутировать state!
      state.todos.push({
        id: Date.now(),
        text,
        done: false,
      });
    }),

    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find(t => t.id === id);
      if (todo) {
        todo.done = !todo.done;
      }
    }),
  }))
);
```

**Преимущества immer:**
- Пишете код как с обычными мутациями
- Под капотом — immutable обновления
- Проще работать со сложными структурами

#### devtools — интеграция с Redux DevTools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      increase: () => set((state) => ({ count: state.count + 1 }), false, 'increase'),
      decrease: () => set((state) => ({ count: state.count - 1 }), false, 'decrease'),
    }),
    { name: 'CounterStore' }
  )
);
```

**Возможности:**
- Просмотр истории изменений
- Time-travel debugging
- Экспорт/импорт состояния

#### Комбинирование middleware

```typescript
const useStore = create<Store>()(
  devtools(
    persist(
      immer((set) => ({
        // ... ваш store
      })),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

---

## Сравнение и выбор подхода {#сравнение}

### MobX vs Zustand

| Критерий | MobX | Zustand |
|----------|------|---------|
| **Размер** | ~16 KB | ~1 KB |
| **Философия** | ООП, классы, декораторы | Функциональный, хуки |
| **Кривая обучения** | Средняя | Низкая |
| **TypeScript** | Хорошая поддержка | Отличная поддержка |
| **DevTools** | Через mobx-react-devtools | Redux DevTools |
| **Производительность** | Отличная (автоматическая оптимизация) | Отличная (селекторы) |
| **Мутации** | Разрешены (в actions) | Через immer middleware |
| **Computed** | Встроенные (getters) | Вручную (селекторы) |
| **Async** | runInAction / flow | Обычный async/await |

### Когда использовать MobX

**Используйте MobX, если:**
- Сложная бизнес-логика
- Много computed values
- ООП-стиль ближе команде
- Нужны автоматические реакции
- Есть опыт с наблюдателями (RxJS, Vue)

**Пример:** CRM-система с множеством связанных сущностей

```typescript
class CRMStore {
  clients: Client[] = [];
  deals: Deal[] = [];
  tasks: Task[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get activeDeals() {
    return this.deals.filter(d => d.status === 'active');
  }

  get totalRevenue() {
    return this.deals
      .filter(d => d.status === 'closed')
      .reduce((sum, d) => sum + d.amount, 0);
  }

  get clientsWithActiveDeals() {
    const activeDealClientIds = new Set(
      this.activeDeals.map(d => d.clientId)
    );
    return this.clients.filter(c => activeDealClientIds.has(c.id));
  }
}
```

### Когда использовать Zustand

**Используйте Zustand, если:**
- Нужна простота и минимализм
- UI-состояние (модалки, формы, фильтры)
- Команда предпочитает функциональный стиль
- Важен размер бандла
- Нужна интеграция с Redux DevTools

**Пример:** UI-состояние приложения

```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentModal: string | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  currentModal: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ currentModal: modal }),
  closeModal: () => set({ currentModal: null }),
}));
```

### Комбинирование подходов

Можно использовать **оба** решения в одном приложении:

```typescript
// MobX для бизнес-логики
class ProductStore {
  products: Product[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get categorizedProducts() {
    return groupBy(this.products, 'category');
  }

  async fetchProducts() {
    const data = await api.getProducts();
    runInAction(() => {
      this.products = data;
    });
  }
}

// Zustand для UI-состояния
const useUIStore = create<UIStore>((set) => ({
  selectedCategory: null,
  sortBy: 'name',
  setCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
}));

// Компонент использует оба
const ProductList = observer(() => {
  const productStore = useProductStore();
  const { selectedCategory, sortBy } = useUIStore();

  const products = productStore.categorizedProducts[selectedCategory] || [];
  const sorted = sortProducts(products, sortBy);

  return (
    <div>
      {sorted.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
});
```

---

## Интеграция с TypeScript {#typescript}

### MobX + TypeScript

#### Типизация store

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoStore {
  todos: Todo[] = [];
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  get filteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  addTodo(text: string): void {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.filter = filter;
  }
}
```

#### Типизация React-компонентов

```typescript
interface TodoListProps {
  store: TodoStore;
}

const TodoList: React.FC<TodoListProps> = observer(({ store }) => {
  return (
    <div>
      {store.filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => store.toggleTodo(todo.id)}
        />
      ))}
    </div>
  );
});
```

### Zustand + TypeScript

#### Полная типизация store

```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return {
      items: [...state.items, { ...item, quantity: 1 }]
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  })),

  clear: () => set({ items: [] }),

  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));
```

#### Типизация селекторов

```typescript
// Хорошо: типизированный селектор
const items = useCartStore((state: CartStore) => state.items);

// Ещё лучше: создайте типизированные селекторы
const useCartItems = () => useCartStore((state) => state.items);
const useCartTotal = () => useCartStore((state) => state.total());
const useAddToCart = () => useCartStore((state) => state.addItem);

// Использование
function Cart() {
  const items = useCartItems();
  const total = useCartTotal();
  const addToCart = useAddToCart();

  return (
    <div>
      <p>Товаров: {items.length}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

---

## Продвинутые паттерны {#advanced}

### MobX: Модульная архитектура

```typescript
// stores/RootStore.ts
class RootStore {
  userStore: UserStore;
  todoStore: TodoStore;
  uiStore: UIStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.todoStore = new TodoStore(this);
    this.uiStore = new UIStore(this);
  }
}

// stores/TodoStore.ts
class TodoStore {
  rootStore: RootStore;
  todos: Todo[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchTodos() {
    // Можем обращаться к другим store
    const userId = this.rootStore.userStore.currentUserId;
    const data = await api.getTodos(userId);
    runInAction(() => {
      this.todos = data;
    });
  }
}

// React Context
const RootStoreContext = createContext<RootStore | null>(null);

export const RootStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMemo(() => new RootStore(), []);
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};

export const useRootStore = () => {
  const store = useContext(RootStoreContext);
  if (!store) throw new Error('useRootStore must be used within RootStoreProvider');
  return store;
};

export const useTodoStore = () => useRootStore().todoStore;
export const useUserStore = () => useRootStore().userStore;
```

### Zustand: Slices паттерн

```typescript
// Разделение большого store на слайсы
interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

interface TodoSlice {
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: number) => void;
}

type Store = UserSlice & TodoSlice;

const createUserSlice: StateCreator<Store, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createTodoSlice: StateCreator<Store, [], [], TodoSlice> = (set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter(t => t.id !== id)
  })),
});

const useStore = create<Store>()((...a) => ({
  ...createUserSlice(...a),
  ...createTodoSlice(...a),
}));
```

### Оптимизация ре-рендеров

#### MobX: автоматическая оптимизация

```typescript
const UserProfile = observer(({ userId }: { userId: number }) => {
  const store = useUserStore();
  const user = store.getUserById(userId);

  // Компонент обновится только при изменении полей,
  // которые используются в рендере
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
});
```

#### Zustand: селекторы с shallow

```typescript
import { shallow } from 'zustand/shallow';

function UserProfile({ userId }: { userId: number }) {
  // Без shallow — ре-рендер при любом изменении store
  const user = useUserStore((state) => state.getUserById(userId));

  // С shallow — ре-рендер только при изменении { name, email }
  const { name, email } = useUserStore(
    (state) => {
      const user = state.getUserById(userId);
      return { name: user.name, email: user.email };
    },
    shallow
  );

  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

### Тестирование

#### MobX Store

```typescript
import { describe, it, expect } from 'vitest';

describe('TodoStore', () => {
  it('should add todo', () => {
    const store = new TodoStore();
    store.addTodo('Test');

    expect(store.todos.length).toBe(1);
    expect(store.todos[0].text).toBe('Test');
  });

  it('should compute completed count', () => {
    const store = new TodoStore();
    store.addTodo('Task 1');
    store.addTodo('Task 2');
    store.toggleTodo(store.todos[0].id);

    expect(store.completedCount).toBe(1);
  });
});
```

#### Zustand Store

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useTodoStore', () => {
  it('should add todo', () => {
    const { result } = renderHook(() => useTodoStore());

    act(() => {
      result.current.addTodo('Test');
    });

    expect(result.current.todos.length).toBe(1);
    expect(result.current.todos[0].text).toBe('Test');
  });
});
```

---

## Best Practices {#best-practices}

### Общие рекомендации

1. **Не храните всё в глобальном состоянии**
   ```typescript
   // ❌ Плохо: форма в глобальном store
   const useAppStore = create((set) => ({
     loginFormEmail: '',
     loginFormPassword: '',
     setLoginFormEmail: (email: string) => set({ loginFormEmail: email }),
   }));

   // ✅ Хорошо: локальное состояние
   function LoginForm() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     // ...
   }
   ```

2. **Разделяйте бизнес-логику и UI-состояние**
   ```typescript
   // MobX для данных и бизнес-логики
   class ProductStore { /* ... */ }

   // Zustand для UI
   const useUIStore = create((set) => ({
     sidebarOpen: false,
     currentTab: 'products',
   }));
   ```

3. **Избегайте излишней нормализации**
   ```typescript
   // ❌ Плохо: слишком нормализовано
   {
     users: { byId: { 1: { name: 'Alice' } }, allIds: [1] },
     posts: { byId: { 1: { userId: 1 } }, allIds: [1] },
   }

   // ✅ Хорошо: простая структура
   {
     users: [{ id: 1, name: 'Alice', posts: [...] }]
   }
   ```

### MobX Best Practices

1. **Всегда используйте actions**
   ```typescript
   // ❌ Плохо
   store.count++; // Прямая мутация

   // ✅ Хорошо
   store.increment(); // Через action
   ```

2. **Используйте computed для производных данных**
   ```typescript
   // ❌ Плохо
   const completedTodos = store.todos.filter(t => t.completed);

   // ✅ Хорошо
   get completedTodos() {
     return this.todos.filter(t => t.completed);
   }
   ```

3. **runInAction для async**
   ```typescript
   async fetchData() {
     const data = await api.getData();
     runInAction(() => {
       this.data = data; // Обязательно в runInAction!
     });
   }
   ```

### Zustand Best Practices

1. **Используйте селекторы**
   ```typescript
   // ❌ Плохо: подписка на весь store
   const store = useStore();

   // ✅ Хорошо: подписка на часть
   const count = useStore((state) => state.count);
   ```

2. **Immutable updates**
   ```typescript
   // ❌ Плохо
   set((state) => {
     state.items.push(newItem); // Мутация
     return state;
   });

   // ✅ Хорошо
   set((state) => ({
     items: [...state.items, newItem]
   }));
   ```

3. **Выносите селекторы**
   ```typescript
   // ✅ Переиспользуемые селекторы
   const selectUser = (state: AppStore) => state.user;
   const selectIsLoggedIn = (state: AppStore) => state.user !== null;

   // Использование
   const user = useAppStore(selectUser);
   const isLoggedIn = useAppStore(selectIsLoggedIn);
   ```

---

## Заключение

### Ключевые выводы

1. **MobX** — отличный выбор для:
   - Сложной бизнес-логики
   - Команд с ООП-бэкграундом
   - Приложений с множеством computed values

2. **Zustand** — идеален для:
   - Простых приложений
   - UI-состояния
   - Функционального стиля

3. **Комбинация** — используйте оба:
   - MobX для domain-логики
   - Zustand для UI-состояния

### Дальнейшее изучение

- **Документация MobX**: https://mobx.js.org
- **Документация Zustand**: https://github.com/pmndrs/zustand
- **MobX State Tree**: для более структурированного подхода
- **Jotai/Recoil**: атомарные state-менеджеры

### Практика

Лучший способ освоить — **практиковаться**:
1. Начните с простого Todo-приложения
2. Добавьте API-интеграцию
3. Реализуйте фильтры и сортировку
4. Добавьте персистентность (localStorage)
5. Оптимизируйте производительность

Успехов в управлении состоянием! 🚀
