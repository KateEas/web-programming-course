# TypeScript - Практическая шпаргалка

## 🚀 Быстрый старт

### Установка TypeScript

```bash

# В проекте
npm install --save-dev typescript

# Компиляция файла
tsc app.ts

# Инициализация tsconfig.json
tsc --init
```

---

## 📝 Основные типы

| Тип | Синтаксис | Пример |
|-----|-----------|--------|
| **string** | `let name: string` | `let name: string = "Анна"` |
| **number** | `let age: number` | `let age: number = 25` |
| **boolean** | `let active: boolean` | `let active: boolean = true` |
| **array** | `let items: type[]` | `let numbers: number[] = [1, 2, 3]` |
| **object** | `let user: {prop: type}` | `let user: {name: string, age: number}` |
| **union** | `let id: string \| number` | `let id: string \| number = "abc123"` |
| **literal** | `let status: "ok" \| "error"` | `let status: "ok" \| "error" = "ok"` |

---

## 🔧 Интерфейсы

### Базовый синтаксис

```typescript
interface User {
    name: string;           // обязательное
    age: number;            // обязательное
    email?: string;         // опциональное
    readonly id: number;    // только для чтения
}

// Использование
const user: User = {
    name: "Анна",
    age: 25,
    id: 1
};
```

### Расширение интерфейсов

```typescript
interface BaseUser {
    name: string;
    age: number;
}

interface AdminUser extends BaseUser {
    permissions: string[];
    isAdmin: true;
}
```

### Функциональные интерфейсы

```typescript
interface Calculator {
    (a: number, b: number): number;
}

const add: Calculator = (a, b) => a + b;
```

---

## 🎯 Функции

### Типизация функций

```typescript
// Явная типизация
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Стрелочные функции
const multiply = (a: number, b: number): number => a * b;

// Опциональные параметры
function log(message: string, level?: string): void {
    console.log(`[${level || 'INFO'}] ${message}`);
}

// Параметры по умолчанию
function createUser(name: string, age: number = 18): User {
    return { name, age };
}

// Rest параметры
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}
```

---

## 🔀 Union и Intersection

### Union типы (|)

```typescript
// Либо string, либо number
let id: string | number;
id = "abc123";  // ✅
id = 12345;     // ✅

// Type narrowing
function formatId(id: string | number): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toString();
}

// Literal union
type Theme = "light" | "dark" | "auto";
type Status = "loading" | "success" | "error";
```

### Intersection типы (&)

```typescript
type PersonalInfo = {
    name: string;
    age: number;
};

type ContactInfo = {
    email: string;
    phone: string;
};

// Должны быть ВСЕ свойства
type User = PersonalInfo & ContactInfo;

const user: User = {
    name: "Анна",
    age: 25,
    email: "anna@email.com",
    phone: "+7-123-456-78-90"
};
```

---

## 🎭 Generics

### Базовый синтаксис

```typescript
// Функция с generic
function identity<T>(arg: T): T {
    return arg;
}

const stringResult = identity<string>("hello");  // string
const numberResult = identity<number>(42);       // number
const autoResult = identity("hello");           // type inference

// Generic интерфейс
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

// Использование
const userResponse: ApiResponse<User> = {
    data: { name: "Анна", age: 25 },
    success: true
};

const usersResponse: ApiResponse<User[]> = {
    data: [
        { name: "Анна", age: 25 },
        { name: "Петр", age: 30 }
    ],
    success: true
};
```

### Generic с ограничениями

```typescript
// T должен иметь свойство length
function logLength<T extends { length: number }>(item: T): T {
    console.log(`Length: ${item.length}`);
    return item;
}

logLength("hello");     // ✅ string
logLength([1, 2, 3]);   // ✅ array
logLength(42);          // ❌ error

// Keyof ограничение
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "Anna", age: 25 };
const name = getProperty(user, "name");  // string
const age = getProperty(user, "age");    // number
```

---

## 🛠 Утилитарные типы

| Утилита | Описание | Пример |
|---------|----------|--------|
| `Partial<T>` | Все свойства опциональные | `Partial<User>` |
| `Required<T>` | Все свойства обязательные | `Required<User>` |
| `Readonly<T>` | Все свойства readonly | `Readonly<User>` |
| `Pick<T, K>` | Выбрать только указанные свойства | `Pick<User, "name" \| "age">` |
| `Omit<T, K>` | Исключить указанные свойства | `Omit<User, "password">` |
| `Record<K, T>` | Объект с ключами K и значениями T | `Record<string, number>` |

### Примеры использования

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

// Все свойства опциональные
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Только нужные свойства
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string; }

// Исключить password
type SafeUser = Omit<User, "password">;
// { id: number; name: string; email: string; }

// Словарь пользователей
type UserMap = Record<string, User>;
// { [key: string]: User }
```

---

## ⚙️ tsconfig.json - Основные опции

```json
{
  "compilerOptions": {
    // Основные
    "target": "ES2020",                    // Версия JS на выходе
    "module": "ESNext",                    // Система модулей
    "lib": ["ES2020", "DOM"],             // Доступные библиотеки
    
    // Строгость
    "strict": true,                        // Все строгие проверки
    "noImplicitAny": true,                // Запретить неявный any
    "strictNullChecks": true,             // Проверки null/undefined
    "noImplicitReturns": true,            // Все пути должны return
    
    // Модули
    "moduleResolution": "node",            // Как искать модули
    "esModuleInterop": true,              // Совместимость ES6/CommonJS
    "allowSyntheticDefaultImports": true, // Синтетические импорты
    
    // Вывод
    "outDir": "./dist",                   // Папка для скомпилированных файлов
    "rootDir": "./src",                   // Корневая папка исходников
    "declaration": true,                  // Генерировать .d.ts файлы
    "sourceMap": true,                    // Генерировать source maps
    
    // React (если нужно)
    "jsx": "react-jsx"                    // Поддержка JSX
  },
  "include": ["src/**/*"],                // Какие файлы компилировать
  "exclude": ["node_modules", "dist"]     // Какие исключить
}
```

---

## 🚨 Type Guards

### typeof guards

```typescript
function processValue(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase(); // TypeScript знает что это string
    }
    return value.toFixed(2);       // TypeScript знает что это number
}
```

### instanceof guards

```typescript
class Dog {
    bark() { console.log("Woof!"); }
}

class Cat {
    meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
    if (animal instanceof Dog) {
        animal.bark(); // TypeScript знает что это Dog
    } else {
        animal.meow(); // TypeScript знает что это Cat
    }
}
```

### Custom type guards

```typescript
interface User {
    name: string;
    email: string;
}

interface Admin {
    name: string;
    permissions: string[];
}

// Custom type guard
function isAdmin(user: User | Admin): user is Admin {
    return 'permissions' in user;
}

function handleUser(user: User | Admin) {
    if (isAdmin(user)) {
        console.log(user.permissions); // TypeScript знает что это Admin
    } else {
        console.log(user.email);       // TypeScript знает что это User
    }
}
```

---

## 🎨 Enum

```typescript
// Числовой enum
enum Status {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

// Строковый enum (предпочтительно)
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}

// Использование
const userStatus: Status = Status.Pending;
const themeColor: Color = Color.Red;

// Const enum (оптимизация)
const enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT"
}
```

---

## 💡 Практические советы

### ✅ Хорошие практики

```typescript
// 1. Используйте type inference
const message = "Hello"; // лучше чем: const message: string = "Hello"

// 2. Предпочитайте interface для объектов
interface User {
    name: string;
    age: number;
}

// 3. Используйте readonly для неизменяемых данных
interface Config {
    readonly apiUrl: string;
    readonly timeout: number;
}

// 4. Строковые литералы вместо enum для простых случаев
type Theme = "light" | "dark";

// 5. Используйте unknown вместо any для неизвестных типов
function processApiData(data: unknown) {
    if (typeof data === 'object' && data !== null) {
        // безопасная обработка
    }
}
```

### ❌ Избегайте

```typescript
// 1. Избегайте any
let data: any = fetchData(); // ❌

// 2. Не дублируйте типы
interface User { name: string; }
interface UserData { name: string; } // ❌ дублирование

// 3. Не переопределяйте встроенные типы
interface String { // ❌ плохая идея
    customMethod(): void;
}
```

---

## 🔍 Отладка типов

```typescript
// Посмотреть тип переменной
type UserType = typeof user; // тип переменной user

// Получить тип возвращаемого значения функции
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// Получить типы параметров функции
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Проверить тип в IDE
const user = { name: "Anna", age: 25 };
type UserKeys = keyof typeof user; // "name" | "age"
```

---

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)
