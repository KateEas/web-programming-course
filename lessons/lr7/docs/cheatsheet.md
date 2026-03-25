# Testing Cheatsheet - Vitest & Playwright

Краткая справка по тестированию React приложений.

---

## Установка

```bash
# Vitest + React Testing Library
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Playwright (опционально)
npm install -D @playwright/test
npx playwright install
```

---

## Конфигурация Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

---

## Базовый синтаксис

### Структура теста

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 5;

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe(10);
  });
});
```

### Хуки

```typescript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

describe('Test Suite', () => {
  beforeAll(() => {
    // Запускается 1 раз перед всеми тестами
  });

  beforeEach(() => {
    // Запускается перед КАЖДЫМ тестом
  });

  afterEach(() => {
    // Запускается после КАЖДОГО теста
  });

  afterAll(() => {
    // Запускается 1 раз после всех тестов
  });
});
```

---

## Matchers (Assertions)

### Базовые

```typescript
expect(value).toBe(5);                    // === (strict equality)
expect(value).toEqual({ a: 1 });          // deep equality
expect(value).toBeTruthy();               // Boolean(value) === true
expect(value).toBeFalsy();                // Boolean(value) === false
expect(value).toBeNull();                 // === null
expect(value).toBeUndefined();            // === undefined
expect(value).toBeDefined();              // !== undefined
```

### Числа

```typescript
expect(value).toBeGreaterThan(3);         // >
expect(value).toBeGreaterThanOrEqual(3);  // >=
expect(value).toBeLessThan(5);            // <
expect(value).toBeLessThanOrEqual(5);     // <=
expect(value).toBeCloseTo(0.3);           // float сравнение
```

### Строки

```typescript
expect(value).toMatch(/pattern/);         // regex
expect(value).toContain('substring');     // includes
expect(value).toHaveLength(10);           // length
```

### Массивы

```typescript
expect(array).toContain(item);            // includes
expect(array).toHaveLength(3);            // length
expect(array).toEqual([1, 2, 3]);         // deep equality
```

### Объекты

```typescript
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ a: 1 });      // partial match
```

### Функции

```typescript
expect(fn).toThrow();                     // бросает ошибку
expect(fn).toThrow('error message');      // с конкретным сообщением
expect(fn).toThrow(TypeError);            // конкретный тип ошибки
```

### Mock функции

```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg');
```

---

## Моки (Mocking)

### Mock функции

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();                   // создать mock
mockFn();                                  // вызвать

expect(mockFn).toHaveBeenCalled();

// Mock с возвращаемым значением
const mockFn = vi.fn(() => 42);
mockFn.mockReturnValue(42);               // один раз
mockFn.mockReturnValueOnce(42);           // только первый вызов

// Mock с Promise
mockFn.mockResolvedValue('data');         // Promise.resolve
mockFn.mockRejectedValue(new Error());    // Promise.reject

// Проверка вызовов
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn.mock.calls[0][0]).toBe('first arg');
```

### Mock модулей

```typescript
// Мокируем весь модуль
vi.mock('./utils', () => ({
  calculateScore: vi.fn(() => 100),
  getUser: vi.fn(() => ({ id: 1, name: 'Test' })),
}));

// Partial mock (часть реальная, часть mock)
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    calculateScore: vi.fn(() => 100),
  };
});
```

### Spy на методы

```typescript
const obj = {
  method: () => 'original',
};

const spy = vi.spyOn(obj, 'method');
spy.mockReturnValue('mocked');

obj.method(); // 'mocked'
expect(spy).toHaveBeenCalled();

spy.mockRestore(); // восстановить оригинал
```

---

## React Testing Library

### Рендеринг

```typescript
import { render, screen } from '@testing-library/react';

const { container, rerender } = render(<Component />);

// Повторный рендер с новыми props
rerender(<Component newProp="value" />);
```

### Queries (поиск элементов)

**Приоритет (от лучшего к худшему):**

```typescript
// 1. getByRole - ЛУЧШИЙ (по accessibility)
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('textbox', { name: 'Email' });
screen.getByRole('heading', { level: 1 });

// 2. getByLabelText - для форм
screen.getByLabelText('Username');

// 3. getByPlaceholderText
screen.getByPlaceholderText('Enter email');

// 4. getByText - для текста
screen.getByText('Hello World');
screen.getByText(/hello/i); // case insensitive

// 5. getByDisplayValue - для inputs с value
screen.getByDisplayValue('Current value');

// 6. getByAltText - для изображений
screen.getByAltText('Profile picture');

// 7. getByTitle - для title атрибута
screen.getByTitle('Close');

// 8. getByTestId - ПОСЛЕДНИЙ RESORT
screen.getByTestId('custom-element');
```

**Варианты queries:**

```typescript
// getBy - найти или упасть (ожидаем что есть)
screen.getByText('Text');

// queryBy - найти или вернуть null (проверка отсутствия)
expect(screen.queryByText('Text')).not.toBeInTheDocument();

// findBy - async поиск (для элементов, которые появятся)
await screen.findByText('Loaded data');

// Множественные элементы
screen.getAllByRole('button');        // массив или ошибка
screen.queryAllByRole('button');      // массив или []
await screen.findAllByRole('button'); // async массив
```

### User Events (взаимодействие)

```typescript
import { userEvent } from '@testing-library/user-event';

const user = userEvent.setup();

// Клик
await user.click(element);
await user.dblClick(element);

// Ввод текста
await user.type(input, 'Hello');
await user.clear(input);

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A

// Select
await user.selectOptions(select, ['option1', 'option2']);

// Upload файла
await user.upload(input, file);

// Hover
await user.hover(element);
await user.unhover(element);
```

### Ожидание изменений

```typescript
import { waitFor } from '@testing-library/react';

// Дождаться пока условие станет true
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// С таймаутом
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 3000 });

// Дождаться исчезновения
await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
```

### Jest-DOM Matchers

```typescript
// Видимость
expect(element).toBeVisible();
expect(element).not.toBeVisible();
expect(element).toBeInTheDocument();

// Состояние
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(checkbox).toBeChecked();
expect(input).toHaveValue('text');
expect(input).toHaveFocus();

// Атрибуты
expect(element).toHaveAttribute('href', '/link');
expect(element).toHaveClass('active');

// Текст
expect(element).toHaveTextContent('Hello');
expect(form).toHaveFormValues({ email: 'test@test.com' });
```

---

## Примеры тестов

### Unit тест (функция)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateScore } from './utils';

describe('calculateScore', () => {
  it('sums up points correctly', () => {
    const answers = [
      { questionId: '1', pointsEarned: 5 },
      { questionId: '2', pointsEarned: 3 },
    ];
    expect(calculateScore(answers)).toBe(8);
  });
});
```

### Component тест (простой)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
```

### Component тест (с взаимодействием)

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with entered data', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});
```

### Store тест (MobX)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  it('toggles answer selection', () => {
    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([0]);

    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([]);
  });
});
```

---

## Playwright E2E

### Базовый синтаксис

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/');

  await page.click('text=Login');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

### Локаторы

```typescript
// Текст
page.locator('text=Submit');
page.getByText('Submit');

// Role
page.getByRole('button', { name: 'Submit' });

// Label
page.getByLabel('Email');

// Placeholder
page.getByPlaceholder('Enter email');

// CSS
page.locator('.class-name');
page.locator('#id');

// XPath (не рекомендуется)
page.locator('xpath=//button');

// Комбинация
page.locator('form').getByRole('button');
```

### Действия

```typescript
await page.click('button');
await page.dblclick('button');
await page.fill('input', 'text');
await page.type('input', 'text'); // медленнее, имитирует набор
await page.check('checkbox');
await page.uncheck('checkbox');
await page.selectOption('select', 'value');
await page.press('input', 'Enter');
await page.hover('element');
```

### Assertions

```typescript
await expect(page.locator('text=Hello')).toBeVisible();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toHaveValue('text');
await expect(page.locator('h1')).toHaveText('Title');
await expect(page.locator('div')).toHaveClass('active');
await expect(page.locator('a')).toHaveAttribute('href', '/link');

// Screenshot
await expect(page).toHaveScreenshot('page.png');
```

---

## Команды

```bash
# Vitest
npm run test              # watch mode
npm run test:run          # run once
npm run test:ui           # UI mode
npm run test:coverage     # с coverage
npm run test -- MyTest    # конкретный файл

# Playwright
npm run test:e2e          # headless
npm run test:e2e:ui       # UI mode
npx playwright show-report # отчет
```

---

## Best Practices

### ✅ DO

- Тестируйте поведение, не implementation details
- Используйте `getByRole` где возможно (accessibility)
- Один тест = одна проверка (KISS)
- Используйте `beforeEach` для setup
- Именуйте тесты понятно: "should do X when Y"
- Используйте AAA pattern (Arrange, Act, Assert)

### ❌ DON'T

- Не тестируйте внутреннее состояние компонента
- Не используйте `.toBeTruthy()` для конкретных значений
- Не мокайте всё подряд
- Не делайте слишком длинные тесты
- Не забывайте `await` для async операций
- Не используйте `getByTestId` без крайней необходимости

---

## Debugging

```typescript
// Вывести DOM
screen.debug();
screen.debug(element);

// Вывести доступные queries
screen.logTestingPlaygroundURL();

// Pause в Playwright
await page.pause();

// Screenshot
await page.screenshot({ path: 'screenshot.png' });
```

---

## Vitest vs Jest

| Vitest | Jest |
|--------|------|
| `import { vi } from 'vitest'` | `jest` (global) |
| `vi.fn()` | `jest.fn()` |
| `vi.mock()` | `jest.mock()` |
| `vi.spyOn()` | `jest.spyOn()` |

**Всё остальное идентично!** Переход = замена `vi` на `jest`.

---

## Полезные ссылки

- [Vitest Docs](https://vitest.dev/)
- [RTL Docs](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Jest-DOM Matchers](https://github.com/testing-library/jest-dom)
