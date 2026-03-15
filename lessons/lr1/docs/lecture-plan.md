# План лекции: Основы TypeScript

## Информация о занятии
- **Тема:** Введение в TypeScript
- **Продолжительность:** 90 минут
- **Целевая аудитория:** Студенты с базовыми знаниями JavaScript
- **Формат:** Лекция с практическими примерами

## Цели занятия
По окончании лекции студенты будут:
- Понимать мотивацию перехода с JavaScript на TypeScript
- Уметь работать с системой типов TypeScript
- Знать основные концепции: интерфейсы, generics, union типы
- Уметь настраивать TypeScript проект

---

## Структура лекции (90 мин)

### 1. Введение и мотивация (15 мин)

#### 1.1 Проблемы JavaScript (7 мин)
**Демонстрация проблем на примерах:**

```javascript
// Проблема 1: Неожиданные типы
function calculateArea(width, height) {
  return width * height;
}

calculateArea("10", 5); // "10505" вместо 50
calculateArea(null); // NaN

// Проблема 2: Опечатки в свойствах
const user = { name: "John", age: 25 };
console.log(user.nmae); // undefined, опечатка не поймана

// Проблема 3: Изменение API
function processUser(userData) {
  return userData.profile.avatar; // Что если profile undefined?
}
```

#### 1.2 Что такое TypeScript (8 мин)
- Надмножество JavaScript
- Статическая типизация
- Компиляция в JavaScript
- Поддержка современных возможностей JS

**Демонстрация решения проблем:**
```typescript
function calculateArea(width: number, height: number): number {
  return width * height;
}

calculateArea("10", 5); // Ошибка компиляции!
```

### 2. Система типов (25 мин)

#### 2.1 Примитивные типы (8 мин)
```typescript
// Основные примитивы
let name: string = "John";
let age: number = 25;
let isStudent: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Type inference - вывод типов
let autoString = "Hello"; // string
let autoNumber = 42; // number

// Any - избегаем использования
let anything: any = "можно всё";
```

**Интерактив:** Студенты определяют типы переменных

#### 2.2 Массивы и объекты (8 мин)
```typescript
// Массивы
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Объекты
let user: {
  name: string;
  age: number;
  isActive?: boolean; // опциональное свойство
} = {
  name: "Alice",
  age: 30
};

// Вложенные объекты
let company: {
  name: string;
  employees: {
    name: string;
    position: string;
  }[];
} = {
  name: "TechCorp",
  employees: [
    { name: "Bob", position: "Developer" }
  ]
};
```

#### 2.3 Union и Intersection типы (9 мин)
```typescript
// Union типы - "ИЛИ"
let id: string | number;
id = "abc123";
id = 123;

function formatId(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toString();
}

// Intersection типы - "И"
type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: string;
  department: string;
};

type EmployeePerson = Person & Employee;

const worker: EmployeePerson = {
  name: "Charlie",
  age: 28,
  employeeId: "EMP001",
  department: "IT"
};
```

### 3. Интерфейсы и типы (20 мин)

#### 3.1 Интерфейсы (10 мин)
```typescript
// Определение интерфейса
interface User {
  readonly id: number; // только для чтения
  name: string;
  email?: string; // опциональное
  tags: string[];
}

// Использование
const newUser: User = {
  id: 1,
  name: "David",
  tags: ["admin", "active"]
};

// Наследование интерфейсов
interface AdminUser extends User {
  permissions: string[];
  lastLogin: Date;
}

const admin: AdminUser = {
  id: 2,
  name: "Emma",
  tags: ["admin"],
  permissions: ["read", "write", "delete"],
  lastLogin: new Date()
};
```

#### 3.2 Type vs Interface (10 мин)
```typescript
// Type alias
type Status = "pending" | "approved" | "rejected";
type UserRole = "user" | "admin" | "moderator";

// Когда использовать type
type Point = {
  x: number;
  y: number;
};

type Shape = Point & {
  width: number;
  height: number;
};

// Когда использовать interface
interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product extends DatabaseEntity {
  name: string;
  price: number;
  category: string;
}
```

**Правила выбора:**
- `interface` - для объектов, которые могут расширяться
- `type` - для union типов, примитивов, computed типов

### 4. Функции в TypeScript (15 мин)

#### 4.1 Типизация функций (8 мин)
```typescript
// Простая функция
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Функция с опциональными параметрами
function createUser(name: string, age?: number, isActive: boolean = true) {
  return {
    name,
    age: age || 0,
    isActive
  };
}

// Функция с rest параметрами
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

// Функциональные выражения
const multiply = (a: number, b: number): number => a * b;

// Типы функций
type Calculator = (a: number, b: number) => number;
const divide: Calculator = (a, b) => a / b;
```

#### 4.2 Overloads (7 мин)
```typescript
// Function overloads
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value * 2;
}

const result1 = process("hello"); // string
const result2 = process(5); // number
```

### 5. Generics для начинающих (10 мин)

```typescript
// Проблема без generics
function getFirstString(arr: string[]): string {
  return arr[0];
}

function getFirstNumber(arr: number[]): number {
  return arr[0];
}

// Решение с generics
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const firstString = getFirst(["a", "b", "c"]); // string
const firstNumber = getFirst([1, 2, 3]); // number

// Generic интерфейсы
interface Container<T> {
  value: T;
  getValue(): T;
}

const stringContainer: Container<string> = {
  value: "hello",
  getValue() {
    return this.value;
  }
};

// Ограничения generics
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello"); // 5
getLength([1, 2, 3]); // 3
getLength({ length: 10 }); // 10
```

### 6. Настройка проекта (5 мин)

#### 6.1 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 6.2 Основные команды
```bash
# Установка TypeScript
npm install -D typescript

# Компиляция
npx tsc

# Watch режим
npx tsc --watch

# Проверка типов без компиляции
npx tsc --noEmit
```

---

## Интерактивные элементы

### Упражнение 1: Исправь типы (во время лекции)
```typescript
// Задание: добавить правильные типы
let user = {
  name: "John",
  age: 25,
  hobbies: ["reading", "coding"]
};

function updateUser(updates) {
  return { ...user, ...updates };
}
```

### Упражнение 2: Создай интерфейс
```typescript
// Создать интерфейс для объекта товара
const product = {
  id: "P001",
  name: "Laptop",
  price: 999.99,
  inStock: true,
  categories: ["electronics", "computers"],
  reviews: [
    { rating: 5, comment: "Great laptop!" },
    { rating: 4, comment: "Good value" }
  ]
};
```

## Домашнее задание
- Прочитать [гайд по TypeScript](./guide.md)
- Изучить [шпаргалку](./cheatsheet.md)
- Поэкспериментировать с [интерактивными примерами](./interactive.html)

## Подготовка к лабораторной работе
- Убедиться что установлен Node.js и npm
- Склонировать репозиторий курса
- Установить VS Code с расширением TypeScript

## Дополнительные материалы
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)