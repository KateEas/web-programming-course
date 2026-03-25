# TypeScript - Полный конспект

## 📘 Содержание

1. [Введение в TypeScript](#введение-в-typescript)
2. [Базовые типы](#базовые-типы)
3. [Union и Intersection типы](#union-и-intersection-типы)
4. [Интерфейсы и типы](#интерфейсы-и-типы)
5. [Generics (Обобщения)](#generics-обобщения)
6. [Настройка tsconfig.json](#настройка-tsconfigjson)
7. [Практические советы](#практические-советы)

---

## 1. Введение в TypeScript

### 🎯 Зачем нужен TypeScript?

TypeScript решает ключевые проблемы JavaScript, добавляя статическую типизацию.

#### ❌ JavaScript проблемы:

```javascript
// Ошибки обнаруживаются только в runtime
function calculatePrice(price, discount) {
    return price - (price * discount / 100);
}

calculatePrice("100", "10"); // "100900" - WTF результат
calculatePrice(100);         // NaN - undefined discount
```

#### ✅ TypeScript решения:

```typescript
function calculatePrice(price: number, discount: number): number {
    return price - (price * discount / 100);
}

calculatePrice("100", "10"); // ❌ Ошибка компиляции
calculatePrice(100);         // ❌ Ошибка компиляции - не хватает аргумента
calculatePrice(100, 10);     // ✅ 90
```

### 🚀 Основные преимущества TypeScript:

- **Статическая типизация** - ошибки находятся на этапе разработки
- **Автодополнение** - IDE знает что доступно
- **Рефакторинг** - безопасное переименование и изменение кода
- **Документация** - типы служат документацией
- **Масштабируемость** - легче поддерживать большие проекты

> 💡 **Важно:** TypeScript компилируется в обычный JavaScript, поэтому работает везде, где работает JS.

---

## 2. Базовые типы

### Примитивные типы

```typescript
// Явное указание типов
let name: string = "Анна";
let age: number = 25;
let isStudent: boolean = true;

// Type inference - TypeScript сам выводит тип
let city = "Москва";        // string
let score = 100;            // number
let isActive = false;       // boolean
```

> 💡 **Совет:** Используйте type inference когда тип очевиден. TypeScript достаточно умный, чтобы вывести тип самостоятельно.

### Массивы и объекты

```typescript
// Массивы
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Анна", "Петр", "Мария"];

// Объекты
let user: {
    name: string;
    age: number;
    email?: string; // опциональное свойство
} = {
    name: "Анна",
    age: 25
    // email необязательный
};
```

### null, undefined и void

```typescript
let data: string | null = null;
let result: undefined = undefined;

function logMessage(msg: string): void {
    console.log(msg);
    // функция ничего не возвращает
}
```

### 📋 Типы данных в TypeScript:

| Тип | Описание | Пример |
|-----|----------|--------|
| `string` | Текстовые данные | `"Hello"` |
| `number` | Числовые данные | `42`, `3.14` |
| `boolean` | true/false | `true`, `false` |
| `array` | Массивы | `[1, 2, 3]` |
| `object` | Объекты | `{name: "Anna"}` |
| `null` | Явное отсутствие значения | `null` |
| `undefined` | Неопределенное значение | `undefined` |
| `void` | Отсутствие возвращаемого значения | `function(): void` |
| `any` | Любой тип (избегайте!) | `any` |

---

## 3. Union и Intersection типы

### Union типы (|)

Позволяют переменной быть одним из нескольких типов.

```typescript
// Переменная может быть одним из нескольких типов
let id: string | number;
id = "abc123";  // ✅
id = 12345;     // ✅
id = true;      // ❌

// Функция с union параметром
function formatId(id: string | number): string {
    // Type narrowing - проверка типа
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toString();
}
```

### Literal типы

Точные значения как типы - очень полезно для создания перечислений.

```typescript
// Точные значения как типы
type Status = "loading" | "success" | "error";
type Theme = "light" | "dark";

let currentStatus: Status = "loading"; // ✅
let userTheme: Theme = "blue";         // ❌ Error
```

### Intersection типы (&)

Объединяют несколько типов в один - должны быть ВСЕ свойства.

```typescript
type PersonalInfo = {
    name: string;
    age: number;
};

type ContactInfo = {
    email: string;
    phone: string;
};

// Объединение типов - должны быть ВСЕ свойства
type User = PersonalInfo & ContactInfo;

let user: User = {
    name: "Анна",
    age: 25,
    email: "anna@example.com",
    phone: "+7-123-456-78-90"
};
```

> 📝 **Разница между Union и Intersection:**
> - Union (|) - "ИЛИ" - может быть одним из типов
> - Intersection (&) - "И" - должен содержать все свойства

---

## 4. Интерфейсы и типы

### Интерфейсы (interface)

Определяют структуру объектов.

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;        // опциональное
    readonly category: string;   // только для чтения
}

// Использование интерфейса
let laptop: Product = {
    id: 1,
    name: "MacBook Pro",
    price: 150000,
    category: "Electronics"
};

// laptop.category = "Computers"; // ❌ readonly свойство
```

### Расширение интерфейсов

```typescript
interface BaseProduct {
    id: number;
    name: string;
    price: number;
}

interface DigitalProduct extends BaseProduct {
    downloadUrl: string;
    fileSize: number;
}

interface PhysicalProduct extends BaseProduct {
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
}
```

### Type aliases vs Interfaces

| Type alias | Interface |
|------------|-----------|
| `type Point = { x: number; y: number; }` | `interface IPoint { x: number; y: number; }` |
| Хорошо для union типов | Можно расширять |
| `type Status = "ok" \| "error"` | `interface IPoint { z?: number; }` |

> 💡 **Когда использовать что:**
> - `interface` - для объектов, которые могут расширяться
> - `type` - для union типов, примитивов, сложных типов

### Функциональные типы

```typescript
// Type alias для функции
type CalculatorFn = (a: number, b: number) => number;

// Interface для функции
interface ICalculator {
    (a: number, b: number): number;
}

// Использование
let add: CalculatorFn = (a, b) => a + b;
let multiply: ICalculator = (a, b) => a * b;
```

---

## 5. Generics (Обобщения)

### 🎯 Зачем нужны Generics?

Позволяют создавать переиспользуемый код, который работает с разными типами.

#### ❌ Без generics - дублирование:

```typescript
function getFirstString(items: string[]): string {
    return items[0];
}

function getFirstNumber(items: number[]): number {
    return items[0];
}
```

#### ✅ С generics - универсально:

```typescript
function getFirst<T>(items: T[]): T {
    return items[0];
}

let firstNumber = getFirst([1, 2, 3]);        // number
let firstName = getFirst(["Anna", "Peter"]);  // string
let firstBool = getFirst([true, false]);      // boolean
```

### Generics с ограничениями

```typescript
// Ограничение - T должен иметь свойство length
function logLength<T extends { length: number }>(item: T): T {
    console.log(`Длина: ${item.length}`);
    return item;
}

logLength("Hello");        // ✅ string has length
logLength([1, 2, 3]);      // ✅ array has length
logLength(42);             // ❌ number doesn't have length
```

### 🌟 Практический пример - API Response

```typescript
interface ApiResponse<T> {
    data: T;
    status: "success" | "error";
    message?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// Типизированный ответ API
let userResponse: ApiResponse<User> = {
    data: {
        id: 1,
        name: "Анна",
        email: "anna@example.com"
    },
    status: "success"
};

let usersResponse: ApiResponse<User[]> = {
    data: [
        { id: 1, name: "Анна", email: "anna@example.com" },
        { id: 2, name: "Петр", email: "peter@example.com" }
    ],
    status: "success"
};
```

---

## 6. Настройка tsconfig.json

### Базовая конфигурация

```json
{
  "compilerOptions": {
    "target": "esnext",                          
    "lib": ["esnext", "DOM"],   
    "allowJs": true,                             
    "skipLibCheck": true,                        
    "esModuleInterop": true,                     
    "allowSyntheticDefaultImports": true,        
    "strict": true,                              
    "forceConsistentCasingInFileNames": true,    
    "noFallthroughCasesInSwitch": true,         
    "module": "ESNext",                          
    "moduleResolution": "bundler",               
    "resolveJsonModule": true,                   
    "isolatedModules": true,                     
    "noEmit": true,                             
    "jsx": "react-jsx"                          
  },
  "include": [
    "src"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### 🔧 Ключевые опции:

- `"strict": true` - включает все строгие проверки
- `"noImplicitAny": true` - запрещает неявный any
- `"strictNullChecks": true` - строгие проверки null/undefined
- `"jsx": "react-jsx"` - поддержка React JSX

> ⚠️ **Внимание:** Включение strict режима может выявить много ошибок в существующем коде, но это хорошо для качества проекта.

---

## 7. Практические советы

### 1. Описывайте малое + собирайте большое

#### ❌ Плохо - слишком сложно для начала:

```typescript
type ComplexType<T extends Record<string, any>, U = keyof T> = {
    [K in U]: T[K] extends Function ? never : T[K];
};
```

#### ✅ Хорошо - простое и понятное:

```typescript
interface User {
    name: string;
    age: number;
}
```

### 2. Используйте Type Inference

#### ❌ Не нужно:

```typescript
let message: string = "Hello World";
```

#### ✅ Лучше:

```typescript
let message = "Hello World"; // TS сам выведет string
```

### 3. Избегайте any

#### ❌ Плохо:

```typescript
let data: any = fetchData();
```

#### ✅ Лучше:

```typescript
interface ApiData {
    id: number;
    name: string;
}
let data: ApiData = fetchData();

// Или используйте unknown для неизвестных данных
let data: unknown = fetchData();
```

### ✅ Чеклист

- [ ] Включите strict режим в tsconfig.json
- [ ] Используйте интерфейсы для объектов
- [ ] Применяйте union типы для ограниченного набора значений
- [ ] Не указывайте типы там, где TS может их вывести
- [ ] Избегайте any - используйте unknown или конкретные типы
- [ ] Используйте readonly для неизменяемых свойств
- [ ] Применяйте опциональные свойства (?:) где нужно

> 💡 **TypeScript** - это инструмент для повышения качества кода.

---

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)
