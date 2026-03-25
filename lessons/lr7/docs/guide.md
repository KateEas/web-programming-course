# Testing Guide - Полное руководство по тестированию React приложений

Подробное руководство по тестированию с Vitest, React Testing Library и Playwright.

---

## Содержание

1. [Зачем нужно тестирование](#зачем-нужно-тестирование)
2. [Тестовая пирамида](#тестовая-пирамида)
3. [Vitest - Основы](#vitest---основы)
4. [React Testing Library](#react-testing-library)
5. [Playwright - E2E тестирование](#playwright---e2e-тестирование)
6. [Паттерны и Best Practices](#паттерны-и-best-practices)
7. [Частые ошибки](#частые-ошибки)

---

## Зачем нужно тестирование

### Преимущества автоматических тестов

1. **Уверенность при рефакторинге**
   - Можете менять код без страха что-то сломать
   - Тесты сразу покажут регрессии

2. **Документация**
   - Тесты показывают КАК использовать код
   - Живая документация, которая не устаревает

3. **Быстрая обратная связь**
   - Не нужно вручную проверять каждую фичу
   - Тесты запускаются за секунды

4. **Экономия времени**
   - Начальные вложения окупаются через месяц
   - Меньше времени на debugging в production

5. **Лучший дизайн кода**
   - Тестируемый код = хорошо структурированный код
   - Заставляет думать об интерфейсах

### Когда НЕ писать тесты

- Прототипы и эксперименты (выбрасываемый код)
- Очень простая логика (геттеры/сеттеры)
- Код генерируется автоматически
- UI который часто меняется (тесты устареют)

---

## Тестовая пирамида

```
        /\
       /E2E\          ← Playwright
      /------\           Медленные, дорогие
     /  INT   \       ← Vitest + RTL
    /----------\         Средние по скорости
   /   UNIT     \     ← Vitest
  /--------------\       Быстрые, много
```

### Unit Tests (60-70% тестов)

**Что тестируют:** Изолированные функции, утилиты, классы

**Характеристики:**
- ⚡ Очень быстрые (миллисекунды)
- 🎯 Тестируют одну вещь
- 🔬 Изолированные (без зависимостей)

**Примеры:**
```typescript
// ✅ Хороший кандидат для unit теста
function calculateDiscount(price: number, percent: number): number {
  return price * (1 - percent / 100);
}

// ✅ Тоже хорошо
class ShoppingCart {
  private items: Item[] = [];

  addItem(item: Item) {
    this.items.push(item);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

### Integration Tests (20-30% тестов)

**Что тестируют:** Взаимодействие компонентов, API calls, stores

**Характеристики:**
- 🐌 Медленнее unit тестов
- 🔗 Тестируют несколько компонентов вместе
- 🎭 Могут использовать моки

**Примеры:**
```typescript
// ✅ Integration тест
test('LoginForm submits data to API', async () => {
  // Тестируем form + API integration
  render(<LoginForm />);
  await user.type(screen.getByLabelText('Email'), 'test@test.com');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  await waitFor(() => {
    expect(mockApiCall).toHaveBeenCalledWith({ email: 'test@test.com' });
  });
});
```

### E2E Tests (5-10% тестов)

**Что тестируют:** Полные user flows от начала до конца

**Характеристики:**
- 🐢 Самые медленные (секунды)
- 💰 Дорогие в поддержке
- 🎬 Тестируют как реальный пользователь
- 🌐 Используют реальный браузер

**Примеры:**
```typescript
// ✅ E2E тест
test('User can complete purchase', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Add to cart');
  await page.click('text=Checkout');
  await page.fill('[name=cardNumber]', '4242424242424242');
  await page.click('text=Pay');

  await expect(page.locator('text=Thank you')).toBeVisible();
});
```

### Правило распределения

- 60-70% - Unit тесты
- 20-30% - Integration тесты
- 5-10% - E2E тесты

Чем выше по пирамиде = медленнее и дороже, но ближе к реальности.

---

## Vitest - Основы

### Почему Vitest, а не Jest?

**Jest** - индустриальный стандарт, используется в 70% проектов.

**Vitest** - современная альтернатива с идентичным API, но:
- ✅ В 2-10 раз быстрее
- ✅ Нативная интеграция с Vite (нулевая настройка)
- ✅ TypeScript из коробки
- ✅ Watch mode с HMR
- ✅ UI Mode (веб-интерфейс)

**Важно:** API на 95% совместим! Знание Vitest = знание Jest.

### Базовая структура теста

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - подготовка
    const input = 5;

    // Act - действие
    const result = double(input);

    // Assert - проверка
    expect(result).toBe(10);
  });
});
```

**AAA Pattern:**
- **Arrange** - подготовить данные и окружение
- **Act** - выполнить тестируемое действие
- **Assert** - проверить результат

### Хуки жизненного цикла

```typescript
describe('Test Suite', () => {
  // Выполняется 1 раз перед всеми тестами в describe
  beforeAll(() => {
    console.log('Setup once');
  });

  // Выполняется перед КАЖДЫМ тестом
  beforeEach(() => {
    console.log('Setup before test');
  });

  // Выполняется после КАЖДОГО теста
  afterEach(() => {
    console.log('Cleanup after test');
  });

  // Выполняется 1 раз после всех тестов
  afterAll(() => {
    console.log('Cleanup once');
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

**Порядок выполнения:**
```
beforeAll
  beforeEach
    test 1
  afterEach
  beforeEach
    test 2
  afterEach
afterAll
```

### Matchers (Assertions)

#### Equality

```typescript
expect(2 + 2).toBe(4);                    // === (strict)
expect({ a: 1 }).toEqual({ a: 1 });       // deep равенство
expect([1, 2, 3]).toStrictEqual([1, 2, 3]); // строгое (undefined тоже учитывается)
```

**Когда что использовать:**
- `toBe()` - для примитивов (numbers, strings, booleans)
- `toEqual()` - для объектов и массивов
- `toStrictEqual()` - когда важны все поля (включая undefined)

#### Truthiness

```typescript
expect(true).toBeTruthy();
expect(false).toBeFalsy();
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('value').toBeDefined();
```

**Помните:**
- Truthy: `true`, `1`, `'string'`, `{}`, `[]`
- Falsy: `false`, `0`, `''`, `null`, `undefined`, `NaN`

#### Numbers

```typescript
expect(10).toBeGreaterThan(5);
expect(10).toBeGreaterThanOrEqual(10);
expect(5).toBeLessThan(10);
expect(5).toBeLessThanOrEqual(5);

// Float сравнение (0.1 + 0.2 !== 0.3)
expect(0.1 + 0.2).toBeCloseTo(0.3);
```

#### Strings

```typescript
expect('Hello World').toMatch(/World/);
expect('test@example.com').toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
expect('Hello').toContain('ell');
expect('  spaces  ').toHaveLength(10);
```

#### Arrays and Iterables

```typescript
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toHaveLength(3);
expect(['a', 'b']).toEqual(expect.arrayContaining(['a']));
```

#### Objects

```typescript
const user = { id: 1, name: 'John', email: 'john@example.com' };

expect(user).toHaveProperty('id');
expect(user).toHaveProperty('id', 1);
expect(user).toMatchObject({ name: 'John' }); // partial match
```

#### Exceptions

```typescript
function throwError() {
  throw new Error('Oops!');
}

expect(() => throwError()).toThrow();
expect(() => throwError()).toThrow('Oops!');
expect(() => throwError()).toThrow(Error);
expect(() => throwError()).toThrow(/oops/i);
```

### Моки (Mocking)

#### Mock функций

```typescript
import { vi } from 'vitest';

// Создание mock функции
const mockFn = vi.fn();

// Вызов
mockFn('arg1', 'arg2');
mockFn('arg3');

// Проверки
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg3');

// Доступ к calls
expect(mockFn.mock.calls[0]).toEqual(['arg1', 'arg2']);
expect(mockFn.mock.calls[1]).toEqual(['arg3']);
```

#### Mock возвращаемых значений

```typescript
const mockFn = vi.fn();

// Одно значение для всех вызовов
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);
expect(mockFn()).toBe(42);

// Разные значения для разных вызовов
mockFn
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(3);

expect(mockFn()).toBe(1);
expect(mockFn()).toBe(2);
expect(mockFn()).toBe(3);
expect(mockFn()).toBe(3);
```

#### Mock для Promises

```typescript
const mockAsyncFn = vi.fn();

// Успешный результат
mockAsyncFn.mockResolvedValue({ data: 'success' });
await expect(mockAsyncFn()).resolves.toEqual({ data: 'success' });

// Ошибка
mockAsyncFn.mockRejectedValue(new Error('Failed'));
await expect(mockAsyncFn()).rejects.toThrow('Failed');

// По разу
mockAsyncFn
  .mockResolvedValueOnce({ id: 1 })
  .mockResolvedValueOnce({ id: 2 });
```

#### Mock модулей

```typescript
// Мокируем весь модуль
vi.mock('./api/client', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([])),
  createUser: vi.fn(),
}));

// Partial mock (часть реальная, часть mock)
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    // Только эту функцию мокаем
    calculateScore: vi.fn(() => 100),
  };
});
```

#### Spy на методы объектов

```typescript
const obj = {
  greet: (name: string) => `Hello, ${name}!`,
};

const spy = vi.spyOn(obj, 'greet');

// Можно вызывать как обычно
expect(obj.greet('John')).toBe('Hello, John!');
expect(spy).toHaveBeenCalledWith('John');

// Или подменить реализацию
spy.mockReturnValue('Mocked greeting');
expect(obj.greet('Anyone')).toBe('Mocked greeting');

// Восстановить оригинал
spy.mockRestore();
expect(obj.greet('John')).toBe('Hello, John!');
```

### Async Testing

```typescript
// Promise
test('async test with await', async () => {
  const data = await fetchData();
  expect(data).toBe('result');
});

// Проверка resolve
test('promise resolves', async () => {
  await expect(fetchData()).resolves.toBe('result');
});

// Проверка reject
test('promise rejects', async () => {
  await expect(fetchData()).rejects.toThrow('Error');
});

// Callback (старый стиль, не рекомендуется)
test('callback', (done) => {
  fetchData((data) => {
    expect(data).toBe('result');
    done();
  });
});
```

---

## React Testing Library

### Философия RTL

**"The more your tests resemble the way your software is used, the more confidence they can give you."**

Основные принципы:
1. Тестируйте поведение, не implementation details
2. Используйте селекторы, доступные пользователю (text, role, label)
3. Не тестируйте внутреннее состояние компонента
4. Тестируйте accessibility заодно

### Queries - поиск элементов

#### Приоритет queries (от лучшего к худшему)

1. **getByRole** - ✅ ЛУЧШИЙ
   ```typescript
   screen.getByRole('button', { name: 'Submit' });
   screen.getByRole('textbox', { name: 'Email' });
   screen.getByRole('heading', { level: 1 });
   screen.getByRole('checkbox', { checked: true });
   ```

   **Почему лучший?**
   - Тестирует accessibility
   - Видит то, что видит screen reader
   - Защищает от проблем с a11y

2. **getByLabelText** - ✅ Для форм
   ```typescript
   screen.getByLabelText('Username');
   screen.getByLabelText(/email/i);
   ```

3. **getByPlaceholderText**
   ```typescript
   screen.getByPlaceholderText('Enter email');
   ```

4. **getByText** - для контента
   ```typescript
   screen.getByText('Hello World');
   screen.getByText(/hello/i);
   screen.getByText((content, element) => content.startsWith('Hello'));
   ```

5. **getByDisplayValue** - для inputs
   ```typescript
   screen.getByDisplayValue('Current value');
   ```

6. **getByAltText** - для изображений
   ```typescript
   screen.getByAltText('Profile picture');
   ```

7. **getByTitle**
   ```typescript
   screen.getByTitle('Close dialog');
   ```

8. **getByTestId** - ⚠️ ПОСЛЕДНИЙ RESORT
   ```typescript
   screen.getByTestId('custom-element');
   ```

   Используйте только если:
   - Нет других способов найти элемент
   - Динамически генерируемый контент
   - Сложная структура

#### Варианты queries

```typescript
// getBy* - найти ИЛИ упасть
const button = screen.getByRole('button');

// queryBy* - найти ИЛИ вернуть null
const button = screen.queryByRole('button');
expect(button).not.toBeInTheDocument(); // проверка отсутствия

// findBy* - async поиск (для элементов которые появятся)
const button = await screen.findByRole('button');

// *All* - множественные элементы
const buttons = screen.getAllByRole('button');
const buttons = screen.queryAllByRole('button'); // [] если нет
const buttons = await screen.findAllByRole('button');
```

**Когда что использовать:**

| Query | Для чего |
|-------|----------|
| `getBy` | Элемент должен быть в DOM |
| `queryBy` | Проверка что элемента НЕТ |
| `findBy` | Элемент появится асинхронно |

### User Events

**⚠️ Используйте `userEvent`, НЕ `fireEvent`!**

```typescript
import { userEvent } from '@testing-library/user-event';

const user = userEvent.setup();

// Клик
await user.click(button);
await user.dblClick(button);
await user.tripleClick(button);

// Ввод текста
await user.type(input, 'Hello World');
await user.type(input, 'User{Enter}'); // с Enter
await user.clear(input);

// Keyboard
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A
await user.keyboard('{Control>}C{/Control}'); // Ctrl+C
await user.tab(); // Tab навигация

// Select
await user.selectOptions(select, 'value');
await user.selectOptions(select, ['value1', 'value2']);

// Checkbox/Radio
await user.click(checkbox); // toggle

// File upload
const file = new File(['content'], 'test.png', { type: 'image/png' });
await user.upload(input, file);

// Hover
await user.hover(element);
await user.unhover(element);

// Pointer
await user.pointer({ keys: '[MouseLeft]', target: element });
```

**Почему `userEvent` лучше `fireEvent`:**
- Более реалистичное поведение
- Автоматически вызывает связанные события (focus, blur, etc.)
- Проверяет что элемент доступен для взаимодействия

### Waiting и Async

```typescript
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

// Дождаться условия
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// С кастомным таймаутом
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 3000, interval: 100 });

// Дождаться исчезновения
await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

// findBy - уже включает waitFor
const element = await screen.findByText('Loaded');
```

**⚠️ Частая ошибка:**

```typescript
// ❌ НЕПРАВИЛЬНО - не используйте getBy в waitFor с expect
await waitFor(() => {
  expect(screen.getByText('Text')).toBeInTheDocument();
});

// ✅ ПРАВИЛЬНО - используйте findBy
await screen.findByText('Text');

// ✅ ПРАВИЛЬНО - или queryBy если нужен expect
await waitFor(() => {
  expect(screen.queryByText('Text')).toBeInTheDocument();
});
```

### Jest-DOM Matchers

```typescript
import '@testing-library/jest-dom';

// Видимость
expect(element).toBeVisible();
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Состояние элементов
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(input).toHaveFocus();
expect(checkbox).toBeChecked();
expect(input).toBeRequired();
expect(input).toBeValid();
expect(input).toBeInvalid();

// Значения
expect(input).toHaveValue('text');
expect(input).toHaveDisplayValue('displayed');
expect(form).toHaveFormValues({ email: 'test@test.com' });

// Атрибуты и классы
expect(link).toHaveAttribute('href', '/path');
expect(element).toHaveClass('active');
expect(element).toHaveStyle({ color: 'red' });

// Текст и контент
expect(element).toHaveTextContent('Hello');
expect(element).toContainHTML('<span>Hello</span>');
expect(element).toBeEmptyDOMElement();

// Accessibility
expect(element).toHaveAccessibleDescription('Description');
expect(element).toHaveAccessibleName('Name');
```

### Примеры компонентных тестов

#### Простой компонент

```typescript
// Button.tsx
interface Props {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled, children }: Props) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### Форма

```typescript
// LoginForm.tsx
interface Props {
  onSubmit: (data: { email: string; password: string }) => void;
}

export function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}

// LoginForm.test.tsx
describe('LoginForm', () => {
  it('submits form with entered credentials', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('does not submit with empty fields', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
```

#### Компонент с API

```typescript
// UserProfile.tsx
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// UserProfile.test.tsx
import { vi } from 'vitest';
import { fetchUser } from './api';

vi.mock('./api', () => ({
  fetchUser: vi.fn(),
}));

describe('UserProfile', () => {
  it('displays user data when loaded', async () => {
    vi.mocked(fetchUser).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    });

    render(<UserProfile userId="1" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await screen.findByText('John Doe');
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows error when user not found', async () => {
    vi.mocked(fetchUser).mockResolvedValue(null);

    render(<UserProfile userId="999" />);

    await screen.findByText('User not found');
  });
});
```

---

## Playwright - E2E тестирование

### Когда использовать E2E

✅ **Используйте для:**
- Критичных user flows (регистрация, оплата, checkout)
- Интеграции с внешними сервисами
- Проверки работы в реальном браузере
- Smoke tests перед деплоем

❌ **Не используйте для:**
- Проверки каждого UI элемента (медленно)
- Unit логики (используйте Vitest)
- Часто меняющихся фич (тесты будут ломаться)

### Основы Playwright

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Открыть страницу
  await page.goto('https://example.com');

  // Взаимодействие
  await page.click('text=Sign in');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.press('input[name="email"]', 'Enter');

  // Проверка
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

### Локаторы

```typescript
// Text
page.locator('text=Submit');
page.getByText('Submit');
page.getByText(/submit/i);

// Role (лучший для accessibility)
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { level: 1 });

// Label
page.getByLabel('Email address');

// Placeholder
page.getByPlaceholder('Enter your email');

// CSS selectors
page.locator('.btn-primary');
page.locator('#submit-btn');
page.locator('button[type="submit"]');

// Комбинации
page.locator('form').getByRole('button', { name: 'Submit' });
page.locator('nav').getByText('Home');

// nth элемент
page.locator('button').nth(2);
page.locator('button').first();
page.locator('button').last();

// Фильтрация
page.locator('button').filter({ hasText: 'Submit' });
page.locator('div').filter({ has: page.locator('button') });
```

### Действия

```typescript
// Клик
await page.click('button');
await page.getByRole('button').click();

// Double click
await page.dblclick('button');

// Fill (очищает + вводит)
await page.fill('input', 'text');

// Type (печатает посимвольно)
await page.type('input', 'text', { delay: 100 });

// Keyboard
await page.press('input', 'Enter');
await page.keyboard.type('Hello');
await page.keyboard.press('Control+C');

// Checkbox/Radio
await page.check('checkbox');
await page.uncheck('checkbox');

// Select
await page.selectOption('select', 'value');
await page.selectOption('select', ['value1', 'value2']);

// Upload
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

// Hover
await page.hover('button');

// Scroll
await page.locator('footer').scrollIntoViewIfNeeded();
```

### Assertions

```typescript
// Видимость
await expect(page.locator('text=Hello')).toBeVisible();
await expect(page.locator('text=Hello')).toBeHidden();
await expect(page.locator('text=Hello')).not.toBeVisible();

// Состояние
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('checkbox')).toBeChecked();

// Значения
await expect(page.locator('input')).toHaveValue('text');
await expect(page.locator('input')).toHaveValues(['v1', 'v2']);

// Текст
await expect(page.locator('h1')).toHaveText('Title');
await expect(page.locator('h1')).toContainText('Partial');

// Атрибуты
await expect(page.locator('a')).toHaveAttribute('href', '/link');
await expect(page.locator('div')).toHaveClass('active');
await expect(page.locator('div')).toHaveClass(/active/);

// Count
await expect(page.locator('li')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('Dashboard');

// Screenshot
await expect(page).toHaveScreenshot('page.png');
```

### Пример E2E теста

```typescript
test.describe('Quiz Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can complete quiz', async ({ page }) => {
    // Login
    await page.click('text=Login');
    await expect(page.locator('text=Logout')).toBeVisible();

    // Start quiz
    await page.click('text=Start Quiz');
    await expect(page.locator('h2')).toBeVisible();

    // Answer first question
    await page.click('button:has-text("A)")');
    await page.click('text=Next Question');

    // Check progress
    await expect(page.locator('text=/Question 2/')).toBeVisible();

    // Answer remaining questions
    for (let i = 0; i < 4; i++) {
      await page.click('button').first();
      const isLast = i === 3;
      await page.click(isLast ? 'text=Finish' : 'text=Next');
    }

    // Check results
    await expect(page.locator('text=/Score:/')).toBeVisible();
  });

  test('essay question requires minimum length', async ({ page }) => {
    await page.click('text=Start Quiz');

    // If essay question
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      // Short answer - button should be disabled
      await textarea.fill('Short');
      await expect(page.getByRole('button', { name: /Next/ })).not.toBeVisible();

      // Long enough - button appears
      await textarea.fill('A'.repeat(100));
      await expect(page.getByRole('button', { name: /Next/ })).toBeVisible();
    }
  });
});
```

---

## Паттерны и Best Practices

### 1. Тестируйте поведение, не детали реализации

```typescript
// ❌ ПЛОХО - тестирует состояние
test('counter increments state', () => {
  const counter = new Counter();
  counter.increment();
  expect(counter.state.count).toBe(1); // implementation detail
});

// ✅ ХОРОШО - тестирует поведение
test('counter shows incremented value', async () => {
  render(<Counter />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Increment' }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Избегайте слишком много моков

```typescript
// ❌ ПЛОХО - мокаем всё
vi.mock('./ComponentA');
vi.mock('./ComponentB');
vi.mock('./utils');
vi.mock('./hooks');

test('renders page', () => {
  render(<Page />); // тестируем пустоту
});

// ✅ ХОРОШО - мокаем только внешние зависимости
vi.mock('./api/client');

test('displays user data', async () => {
  vi.mocked(fetchUser).mockResolvedValue({ name: 'John' });
  render(<Page />);
  await screen.findByText('John');
});
```

### 3. Один тест = одна проверка

```typescript
// ❌ ПЛОХО - тестирует всё сразу
test('form works', async () => {
  render(<Form />);
  // ... 50 строк кода ...
  expect(submitButton).toBeDisabled();
  expect(emailInput).toBeInvalid();
  expect(passwordInput).toHaveValue('');
  // ... еще 20 проверок ...
});

// ✅ ХОРОШО - разделено на тесты
test('submit button is disabled by default', () => {
  render(<Form />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

test('shows error for invalid email', async () => {
  render(<Form />);
  await user.type(screen.getByLabelText('Email'), 'invalid');
  await user.tab();
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
});
```

### 4. Используйте Page Object для E2E

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoggedIn() {
    await expect(this.page.locator('text=Logout')).toBeVisible();
  }
}

// test
test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@test.com', 'password');
  await loginPage.expectLoggedIn();
});
```

### 5. Используйте Custom Renders

```typescript
// test/utils.tsx
function renderWithProviders(
  ui: ReactElement,
  { store = createStore(), ...options } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StoreProvider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </StoreProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// В тестах
test('component with store', () => {
  renderWithProviders(<MyComponent />);
  // ...
});
```

---

## Частые ошибки

### 1. Забыли await для async операций

```typescript
// ❌ ПЛОХО
test('clicks button', () => {
  const user = userEvent.setup();
  user.click(button); // забыли await
  expect(mockFn).toHaveBeenCalled(); // может не вызваться
});

// ✅ ХОРОШО
test('clicks button', async () => {
  const user = userEvent.setup();
  await user.click(button);
  expect(mockFn).toHaveBeenCalled();
});
```

### 2. Используют getBy вместо findBy для async

```typescript
// ❌ ПЛОХО
test('shows loaded data', async () => {
  render(<Component />);
  expect(screen.getByText('Data')).toBeInTheDocument(); // упадёт
});

// ✅ ХОРОШО
test('shows loaded data', async () => {
  render(<Component />);
  await screen.findByText('Data'); // дождётся появления
});
```

### 3. Тестируют implementation details

```typescript
// ❌ ПЛОХО
test('state updates', () => {
  const wrapper = shallow(<Component />);
  wrapper.setState({ count: 1 });
  expect(wrapper.state('count')).toBe(1);
});

// ✅ ХОРОШО
test('displays count', async () => {
  render(<Component />);
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 4. Не очищают моки

```typescript
// ❌ ПЛОХО
const mockFn = vi.fn();

test('test 1', () => {
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test('test 2', () => {
  expect(mockFn).toHaveBeenCalledTimes(0); // FAIL! Всё еще 1
});

// ✅ ХОРОШО
beforeEach(() => {
  mockFn.mockClear();
  // или vi.clearAllMocks();
});
```

### 5. Слишком специфичные селекторы

```typescript
// ❌ ПЛОХО
screen.getByTestId('submit-btn-primary-large-variant-2');

// ✅ ХОРОШО
screen.getByRole('button', { name: 'Submit' });
```

---

## Дополнительные темы

### MSW (Mock Service Worker)

Мокирование API на уровне сети:

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  }),

  http.post('/api/login', async ({ request }) => {
    const { email } = await request.json();
    return HttpResponse.json({ token: 'abc123' });
  }),
];

// test
import { setupServer } from 'msw/node';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Snapshot тестирование

```typescript
test('component matches snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container.firstChild).toMatchSnapshot();
});

// Создаёт __snapshots__/Button.test.tsx.snap
// При изменениях - npm run test -- -u для обновления
```

**Когда использовать:**
- Сложные UI структуры
- Проверка что ничего не сломалось
- Компонентные библиотеки

**Когда НЕ использовать:**
- Динамический контент (даты, ID)
- Часто меняющийся UI
- Вместо обычных assertions

### Coverage

```bash
npm run test:coverage
```

**Целевые показатели:**
- Statements: 70-80%
- Branches: 70-80%
- Functions: 70-80%
- Lines: 70-80%

**100% coverage ≠ хорошие тесты!**

Лучше 70% coverage с качественными тестами, чем 100% с плохими.

---

## Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about#priority)
- [Common Mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW Documentation](https://mswjs.io/)
