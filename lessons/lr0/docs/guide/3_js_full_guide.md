# Конспект по JavaScript

## Справочная информация
**Основной справочник:** [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/JavaScript)  
**Интерактивное обучение:** [learn.javascript.ru](https://learn.javascript.ru/)  
**Песочница для тестов:** [codepen.io](https://codepen.io/), [jsfiddle.net](https://jsfiddle.net/)

## Содержание
1. [О JavaScript](#о-javascript)
2. [Основы языка](#основы-языка)
3. [Функции](#функции)
4. [Объекты и массивы](#объекты-и-массивы)
5. [Работа с DOM](#работа-с-dom)
6. [События](#события)
7. [Работа с формами](#работа-с-формами)
8. [Асинхронность](#асинхронность)
9. [Работа с API](#работа-с-api)
10. [Современные возможности ES6+](#современные-возможности-es6)

---

## О JavaScript

### Что такое JavaScript
JavaScript - это язык программирования для веб-страниц. Он делает сайты **интерактивными**: обрабатывает клики, проверяет формы, анимирует элементы, загружает данные без перезагрузки страницы.

### Версии и стандарты
JavaScript развивается и имеет разные версии (ES5, ES6, ES2017, ES2020...). **Мы изучаем современный JavaScript (ES6+)** - актуальный стандарт с удобным синтаксисом.

### Подключение к HTML
```html
<!-- Внутренний JavaScript -->
<script>
  console.log('Привет, мир!');
</script>

<!-- Внешний файл -->
<script src="script.js"></script>

<!-- Лучше размещать перед закрывающим </body> -->
```

### Консоль разработчика
Открыть: F12 → Console (или ПКМ → Исследовать элемент → Console)
```javascript
console.log('Сообщение для отладки');
console.error('Ошибка');
console.warn('Предупреждение');
```

---

## Основы языка

### Переменные (современный способ)
```javascript
// const - константа (нельзя изменить)
const name = 'Иван';
const PI = 3.14159;

// let - обычная переменная (можно изменить)
let age = 25;
let isVisible = true;

// ❌ Устаревший способ (не используйте)
var oldStyle = 'плохо';
```

**Правила именования:**
- Начинать с буквы, $ или _
- Использовать camelCase: `userName`, `isLoggedIn`
- Говорящие имена: `userAge` лучше чем `x`

### Типы данных

#### Примитивные типы
```javascript
// Строки (string)
const firstName = 'Анна';
const lastName = "Иванова";
const fullName = `${firstName} ${lastName}`; // Шаблонные строки

// Числа (number)
const age = 30;
const price = 99.99;
const result = age + 5; // 35

// Логические значения (boolean)
const isActive = true;
const isHidden = false;

// Undefined и null
let data; // undefined (не определено)
let user = null; // null (намеренно пустое значение)
```

#### Проверка типа
```javascript
typeof 'привет';    // 'string'
typeof 42;          // 'number'  
typeof true;        // 'boolean'
typeof undefined;   // 'undefined'
typeof null;        // 'object' (особенность JS)
```

### Операторы

#### Арифметические
```javascript
let a = 10;
let b = 3;

console.log(a + b);  // 13 (сложение)
console.log(a - b);  // 7 (вычитание)
console.log(a * b);  // 30 (умножение)
console.log(a / b);  // 3.333... (деление)
console.log(a % b);  // 1 (остаток от деления)

// Сокращенная запись
a += 5;  // то же что a = a + 5
a++;     // то же что a = a + 1
a--;     // то же что a = a - 1
```

#### Сравнения
```javascript
// Строгое сравнение (рекомендуется)
5 === 5;     // true
5 === '5';   // false (разные типы)
5 !== 3;     // true

// Нестрогое сравнение (избегайте)
5 == '5';    // true (приводит к одному типу)

// Другие сравнения
10 > 5;      // true
10 >= 10;    // true
5 < 3;       // false
```

#### Логические
```javascript
const isAdult = age >= 18;
const hasLicense = true;

// И (&&) - все условия должны быть true
const canDrive = isAdult && hasLicense;

// ИЛИ (||) - хотя бы одно условие true
const canEnter = isAdult || hasParentPermission;

// НЕ (!) - инверсия
const isChild = !isAdult;
```

### Условия

#### if/else
```javascript
const age = 20;

if (age >= 18) {
  console.log('Совершеннолетний');
} else if (age >= 14) {
  console.log('Подросток');
} else {
  console.log('Ребенок');
}

// Тернарный оператор (короткая запись)
const status = age >= 18 ? 'взрослый' : 'ребенок';
```

#### Практические примеры
```javascript
// Проверка заполненности поля
const userName = document.getElementById('name').value;
if (userName.trim() === '') {
  alert('Введите имя');
  return;
}

// Показ/скрытие элемента
const menu = document.getElementById('menu');
if (menu.style.display === 'none') {
  menu.style.display = 'block';
} else {
  menu.style.display = 'none';
}
```

### Циклы

#### for - когда знаем количество итераций
```javascript
// Вывести числа от 1 до 5
for (let i = 1; i <= 5; i++) {
  console.log(i);
}

// Перебор массива
const colors = ['красный', 'синий', 'зеленый'];
for (let i = 0; i < colors.length; i++) {
  console.log(colors[i]);
}
```

#### for...of - перебор массивов (современный способ)
```javascript
const fruits = ['яблоко', 'банан', 'апельсин'];

for (const fruit of fruits) {
  console.log(fruit);
}
```

#### while - когда не знаем точное количество итераций
```javascript
let count = 0;
while (count < 3) {
  console.log('Итерация:', count);
  count++;
}
```

---

## Функции

### Объявление функций

#### Function Declaration (классический способ)
```javascript
function greet(name) {
  return `Привет, ${name}!`;
}

const message = greet('Анна'); // "Привет, Анна!"
```

#### Arrow Functions (современный способ)
```javascript
// Короткая запись для простых функций
const add = (a, b) => a + b;
const square = x => x * x;
const sayHello = () => console.log('Привет!');

// Для сложных функций
const processUser = (user) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  return fullName.toUpperCase();
};
```

### Параметры и аргументы
```javascript
// Параметры по умолчанию
function createUser(name, age = 18, city = 'Москва') {
  return { name, age, city };
}

createUser('Анна');              // age=18, city='Москва'
createUser('Петр', 25);          // age=25, city='Москва'  
createUser('Мария', 30, 'СПб');  // все указано

// Деструктуризация параметров
function showUserInfo({ name, age, email }) {
  console.log(`${name}, ${age} лет, ${email}`);
}

const user = { name: 'Иван', age: 25, email: 'ivan@mail.ru' };
showUserInfo(user);
```

### Область видимости
```javascript
const globalVar = 'Глобальная переменная';

function example() {
  const localVar = 'Локальная переменная';
  
  console.log(globalVar); // ✅ Доступна
  console.log(localVar);  // ✅ Доступна
}

console.log(globalVar); // ✅ Доступна
console.log(localVar);  // ❌ Ошибка! Не доступна вне функции
```

### Практические примеры
```javascript
// Валидация email
const isValidEmail = (email) => {
  return email.includes('@') && email.includes('.');
};

// Форматирование цены
const formatPrice = (price) => {
  return `${price.toLocaleString()} ₽`;
};

// Получение случайного числа
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Использование
console.log(isValidEmail('test@mail.ru'));  // true
console.log(formatPrice(15000));            // "15 000 ₽"
console.log(getRandomNumber(1, 10));        // случайное число от 1 до 10
```

---

## Объекты и массивы

### Объекты

#### Создание и работа с объектами
```javascript
// Создание объекта
const user = {
  name: 'Анна',
  age: 25,
  email: 'anna@mail.ru',
  isActive: true
};

// Доступ к свойствам
console.log(user.name);        // "Анна"
console.log(user['email']);    // "anna@mail.ru"

// Изменение свойств
user.age = 26;
user.city = 'Москва';          // Добавление нового свойства

// Удаление свойств
delete user.isActive;
```

#### Методы объектов
```javascript
const calculator = {
  result: 0,
  
  add(number) {
    this.result += number;
    return this; // для цепочки вызовов
  },
  
  multiply(number) {
    this.result *= number;
    return this;
  },
  
  getResult() {
    return this.result;
  }
};

// Использование
calculator.add(5).multiply(2).getResult(); // 10
```

#### Деструктуризация объектов
```javascript
const user = { name: 'Иван', age: 30, city: 'Москва' };

// Вместо:
const name = user.name;
const age = user.age;

// Современный способ:
const { name, age, city } = user;

// С переименованием
const { name: userName, age: userAge } = user;

// Со значениями по умолчанию
const { name, age, country = 'Россия' } = user;
```

### Массивы

#### Создание и основные операции
```javascript
// Создание массива
const fruits = ['яблоко', 'банан', 'апельсин'];
const numbers = [1, 2, 3, 4, 5];
const mixed = ['текст', 42, true, { name: 'объект' }];

// Доступ к элементам
console.log(fruits[0]);        // "яблоко"
console.log(fruits.length);    // 3

// Изменение элементов
fruits[1] = 'груша';
fruits.push('киви');           // Добавить в конец
fruits.unshift('манго');       // Добавить в начало
const lastFruit = fruits.pop(); // Удалить последний
const firstFruit = fruits.shift(); // Удалить первый
```

#### Полезные методы массивов
```javascript
const numbers = [1, 2, 3, 4, 5];

// map - преобразование каждого элемента
const doubled = numbers.map(num => num * 2); // [2, 4, 6, 8, 10]

// filter - фильтрация элементов
const evenNumbers = numbers.filter(num => num % 2 === 0); // [2, 4]

// find - поиск первого подходящего элемента
const found = numbers.find(num => num > 3); // 4

// includes - проверка наличия элемента
const hasThree = numbers.includes(3); // true

// forEach - выполнение действия для каждого элемента
numbers.forEach(num => console.log(num));

// reduce - сведение массива к одному значению
const sum = numbers.reduce((total, num) => total + num, 0); // 15
```

#### Практические примеры
```javascript
// Список пользователей
const users = [
  { name: 'Анна', age: 25, city: 'Москва' },
  { name: 'Петр', age: 30, city: 'СПб' },
  { name: 'Мария', age: 22, city: 'Москва' }
];

// Найти пользователей из Москвы
const moscowUsers = users.filter(user => user.city === 'Москва');

// Получить список имен
const names = users.map(user => user.name);

// Найти пользователя по имени
const anna = users.find(user => user.name === 'Анна');

// Средний возраст
const averageAge = users.reduce((sum, user) => sum + user.age, 0) / users.length;
```

### Деструктуризация массивов
```javascript
const colors = ['красный', 'синий', 'зеленый'];

// Вместо:
const first = colors[0];
const second = colors[1];

// Современный способ:
const [first, second, third] = colors;

// Пропуск элементов
const [firstColor, , thirdColor] = colors;

// Со значениями по умолчанию
const [red, blue, green, yellow = 'желтый'] = colors;
```

---

## Работа с DOM

### Что такое DOM
DOM (Document Object Model) - это представление HTML-страницы в виде дерева объектов, которыми можно управлять через JavaScript.

### Поиск элементов
```javascript
// По ID (самый быстрый способ)
const header = document.getElementById('header');

// По классу (возвращает коллекцию)
const buttons = document.getElementsByClassName('btn');
const firstButton = buttons[0];

// По тегу
const paragraphs = document.getElementsByTagName('p');

// Универсальные селекторы (современный способ)
const element = document.querySelector('#header');        // Первый элемент
const allButtons = document.querySelectorAll('.btn');     // Все элементы

// CSS-селекторы
const menuItems = document.querySelectorAll('nav ul li');
const activeButton = document.querySelector('.btn.active');
```

### Изменение содержимого
```javascript
const title = document.getElementById('title');

// Изменение текста
title.textContent = 'Новый заголовок';

// Изменение HTML (осторожно с пользовательскими данными!)
title.innerHTML = '<strong>Жирный</strong> заголовок';

// Добавление HTML в конец
title.innerHTML += ' - дополнение';
```

### Изменение стилей
```javascript
const box = document.getElementById('box');

// Изменение отдельных стилей
box.style.color = 'red';
box.style.backgroundColor = 'yellow';
box.style.fontSize = '20px';

// Несколько стилей сразу
box.style.cssText = 'color: red; background: yellow; font-size: 20px;';

// Показать/скрыть элемент
box.style.display = 'none';   // Скрыть
box.style.display = 'block';  // Показать
```

### Работа с классами
```javascript
const button = document.querySelector('.btn');

// Добавить класс
button.classList.add('active');

// Удалить класс
button.classList.remove('disabled');

// Переключить класс (если есть - удалить, если нет - добавить)
button.classList.toggle('hidden');

// Проверить наличие класса
if (button.classList.contains('active')) {
  console.log('Кнопка активна');
}

// Заменить класс
button.classList.replace('old-class', 'new-class');
```

### Работа с атрибутами
```javascript
const link = document.querySelector('a');

// Получить атрибут
const href = link.getAttribute('href');

// Установить атрибут
link.setAttribute('href', 'https://example.com');
link.setAttribute('target', '_blank');

// Удалить атрибут
link.removeAttribute('target');

// Проверить наличие атрибута
if (link.hasAttribute('download')) {
  console.log('Это ссылка для скачивания');
}

// Специальные свойства
link.href = 'https://example.com';    // То же что setAttribute('href', ...)
link.textContent = 'Новый текст ссылки';
```

### Создание и удаление элементов
```javascript
// Создание нового элемента
const newDiv = document.createElement('div');
newDiv.textContent = 'Новый блок';
newDiv.className = 'my-class';

// Добавление в DOM
const container = document.getElementById('container');
container.appendChild(newDiv);           // В конец
container.insertBefore(newDiv, firstChild); // Перед определенным элементом

// Современный способ вставки
container.insertAdjacentHTML('beforeend', '<p>Новый параграф</p>');

// Удаление элемента
const elementToRemove = document.getElementById('old-element');
elementToRemove.remove(); // Современный способ
// elementToRemove.parentNode.removeChild(elementToRemove); // Старый способ
```

### Практические примеры
```javascript
// Смена темы сайта
const toggleTheme = () => {
  document.body.classList.toggle('dark-theme');
};

// Показать/скрыть меню
const toggleMenu = () => {
  const menu = document.getElementById('menu');
  menu.classList.toggle('open');
};

// Подсчет символов в поле ввода
const updateCharCount = (input) => {
  const counter = document.getElementById('char-counter');
  const remaining = 100 - input.value.length;
  counter.textContent = `Осталось: ${remaining} символов`;
};

// Добавление элемента в список
const addToList = (text) => {
  const list = document.getElementById('todo-list');
  const item = document.createElement('li');
  item.textContent = text;
  list.appendChild(item);
};
```

---

## События

### Что такое события
События - это действия пользователя (клики, ввод текста, движения мыши) или браузера (загрузка страницы), на которые можно реагировать с помощью JavaScript.

### Добавление обработчиков событий

#### addEventListener (рекомендуемый способ)
```javascript
const button = document.getElementById('myButton');

// Обработчик клика
button.addEventListener('click', function() {
  console.log('Кнопка нажата!');
});

// С arrow function
button.addEventListener('click', () => {
  console.log('Кнопка нажата!');
});

// С именованной функцией
const handleClick = () => {
  console.log('Кнопка нажата!');
};
button.addEventListener('click', handleClick);
```

#### Другие способы (менее гибкие)
```javascript
// Через атрибут HTML
<button onclick="alert('Нажата!')">Кнопка</button>

// Через свойство элемента
button.onclick = function() {
  console.log('Кнопка нажата!');
};
```

### Основные типы событий

#### События мыши
```javascript
const element = document.getElementById('box');

element.addEventListener('click', () => {
  console.log('Клик');
});

element.addEventListener('dblclick', () => {
  console.log('Двойной клик');
});

element.addEventListener('mouseenter', () => {
  console.log('Мышь вошла в элемент');
});

element.addEventListener('mouseleave', () => {
  console.log('Мышь покинула элемент');
});

element.addEventListener('mousedown', () => {
  console.log('Кнопка мыши нажата');
});

element.addEventListener('mouseup', () => {
  console.log('Кнопка мыши отпущена');
});
```

#### События клавиатуры
```javascript
const input = document.getElementById('myInput');

input.addEventListener('keydown', (event) => {
  console.log('Клавиша нажата:', event.key);
});

input.addEventListener('keyup', (event) => {
  console.log('Клавиша отпущена:', event.key);
});

// Обработка конкретных клавиш
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    console.log('Нажат Enter');
  }
  
  if (event.key === 'Escape') {
    console.log('Нажат Escape');
  }
});
```

#### События формы
```javascript
const form = document.getElementById('myForm');
const input = document.getElementById('email');

// Отправка формы
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Отменить стандартную отправку
  console.log('Форма отправлена');
});

// Изменение значения поля
input.addEventListener('input', (event) => {
  console.log('Значение изменилось:', event.target.value);
});

// Фокус и потеря фокуса
input.addEventListener('focus', () => {
  console.log('Поле получило фокус');
});

input.addEventListener('blur', () => {
  console.log('Поле потеряло фокус');
});
```

### Объект события (Event)
```javascript
button.addEventListener('click', (event) => {
  console.log('Тип события:', event.type);           // 'click'
  console.log('Элемент:', event.target);             // Элемент, на котором произошло событие
  console.log('Координаты:', event.clientX, event.clientY); // Координаты мыши
  
  // Отмена стандартного поведения
  event.preventDefault();
  
  // Остановка всплытия события
  event.stopPropagation();
});
```

### Делегирование событий
```javascript
// Вместо добавления обработчика на каждую кнопку
const container = document.getElementById('button-container');

container.addEventListener('click', (event) => {
  // Проверяем, что кликнули именно по кнопке
  if (event.target.classList.contains('btn')) {
    console.log('Нажата кнопка:', event.target.textContent);
  }
});

// Теперь все кнопки внутри container будут обрабатываться одним обработчиком
```

### Практические примеры
```javascript
// Аккордеон
const toggleAccordion = (header) => {
  const content = header.nextElementSibling;
  const isOpen = content.style.display === 'block';
  
  content.style.display = isOpen ? 'none' : 'block';
  header.classList.toggle('active');
};

// Модальное окно
const openModal = () => {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Отключить прокрутку
};

const closeModal = () => {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.body.style.overflow = ''; // Включить прокрутку
};

// Закрытие по клику вне модального окна
document.addEventListener('click', (event) => {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
});

// Закрытие по Escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Плавная прокрутка к якорю
const smoothScrollTo = (targetId) => {
  const target = document.getElementById(targetId);
  target.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
};
```

---

## Работа с формами

### Получение данных из форм

#### Доступ к элементам формы
```javascript
const form = document.getElementById('contactForm');

// Через name атрибут
const nameInput = form.elements.name;           // <input name="name">
const emailInput = form.elements.email;        // <input name="email">
const messageTextarea = form.elements.message; // <textarea name="message">

// Через querySelector
const phoneInput = form.querySelector('input[name="phone"]');
const submitButton = form.querySelector('button[type="submit"]');
```

#### Получение значений
```javascript
// Текстовые поля
const name = nameInput.value;
const email = emailInput.value.trim(); // trim() убирает пробелы

// Checkbox
const agreeCheckbox = form.elements.agree;
const isAgreed = agreeCheckbox.checked; // true/false

// Radio buttons
const genderRadios = form.elements.gender; // Группа radio
let selectedGender = '';
for (const radio of genderRadios) {
  if (radio.checked) {
    selectedGender = radio.value;
    break;
  }
}

// Select dropdown
const countrySelect = form.elements.country;
const selectedCountry = countrySelect.value;
const selectedIndex = countrySelect.selectedIndex;
```

### Валидация форм

#### Простая валидация
```javascript
const validateForm = (form) => {
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const phone = form.elements.phone.value.trim();
  
  // Проверка обязательных полей
  if (!name) {
    showError('Введите имя');
    return false;
  }
  
  if (!email) {
    showError('Введите email');
    return false;
  }
  
  // Проверка формата email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showError('Введите корректный email');
    return false;
  }
  
  // Проверка телефона (базовая)
  if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
    showError('Введите корректный номер телефона');
    return false;
  }
  
  return true; // Все проверки пройдены
};

const showError = (message) => {
  alert(message); // В реальном проекте лучше использовать красивые уведомления
};
```

#### Валидация в реальном времени
```javascript
const setupRealTimeValidation = () => {
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  
  emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (email && !isValid) {
      emailError.textContent = 'Некорректный email';
      emailInput.classList.add('error');
    } else {
      emailError.textContent = '';
      emailInput.classList.remove('error');
    }
  });
};
```

### Отправка форм

#### Обработка submit события
```javascript
const form = document.getElementById('contactForm');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Отменить стандартную отправку
  
  // Валидация
  if (!validateForm(form)) {
    return;
  }
  
  // Сбор данных
  const formData = new FormData(form);
  
  // Или создание объекта вручную
  const data = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    message: form.elements.message.value.trim()
  };
  
  // Отправка на сервер
  try {
    const response = await fetch('/submit-form', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      showSuccess('Форма успешно отправлена!');
      form.reset(); // Очистить форму
    } else {
      showError('Ошибка при отправке формы');
    }
  } catch (error) {
    showError('Ошибка сети. Попробуйте позже.');
  }
});
```

### Работа с FormData
```javascript
// Создание FormData из формы
const form = document.getElementById('myForm');
const formData = new FormData(form);

// Добавление данных вручную
formData.append('timestamp', Date.now());
formData.append('source', 'website');

// Получение значений
const name = formData.get('name');
const allFiles = formData.getAll('files[]'); // Для multiple файлов

// Преобразование в обычный объект
const dataObject = Object.fromEntries(formData.entries());
```

### Практические примеры

#### Форма обратной связи
```javascript
const setupContactForm = () => {
  const form = document.getElementById('contact-form');
  const submitButton = form.querySelector('button[type="submit"]');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Показать загрузку
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        form.style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
      } else {
        throw new Error('Ошибка сервера');
      }
    } catch (error) {
      alert('Произошла ошибка. Попробуйте позже.');
    } finally {
      // Восстановить кнопку
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить';
    }
  });
};
```

#### Поиск с автодополнением
```javascript
const setupSearch = () => {
  const searchInput = document.getElementById('search');
  const suggestions = document.getElementById('suggestions');
  let timeout;
  
  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    
    // Очистить предыдущий таймер
    clearTimeout(timeout);
    
    if (query.length < 2) {
      suggestions.style.display = 'none';
      return;
    }
    
    // Задержка для уменьшения количества запросов
    timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        displaySuggestions(results);
      } catch (error) {
        console.error('Ошибка поиска:', error);
      }
    }, 300);
  });
};

const displaySuggestions = (results) => {
  const suggestions = document.getElementById('suggestions');
  
  if (results.length === 0) {
    suggestions.style.display = 'none';
    return;
  }
  
  suggestions.innerHTML = results
    .map(item => `<div class="suggestion-item">${item.title}</div>`)
    .join('');
  
  suggestions.style.display = 'block';
};
```

---

## Асинхронность

### Что такое асинхронность
Асинхронный код позволяет выполнять операции (загрузка данных, таймеры) не блокируя выполнение остального кода. JavaScript однопоточный, но асинхронность позволяет ему эффективно работать с медленными операциями.

### setTimeout и setInterval
```javascript
// setTimeout - выполнить один раз через указанное время
setTimeout(() => {
  console.log('Выполнилось через 2 секунды');
}, 2000);

// setInterval - выполнять периодически
const intervalId = setInterval(() => {
  console.log('Выполняется каждую секунду');
}, 1000);

// Остановка интервала
clearInterval(intervalId);

// Практический пример - таймер обратного отсчета
const startCountdown = (seconds) => {
  const display = document.getElementById('countdown');
  
  const timer = setInterval(() => {
    display.textContent = seconds;
    seconds--;
    
    if (seconds < 0) {
      clearInterval(timer);
      display.textContent = 'Время вышло!';
    }
  }, 1000);
};
```

### Promises (Промисы)
```javascript
// Создание промиса
const fetchUserData = (userId) => {
  return new Promise((resolve, reject) => {
    // Имитация запроса к серверу
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: 'Иван', email: 'ivan@mail.ru' });
      } else {
        reject(new Error('Неверный ID пользователя'));
      }
    }, 1000);
  });
};

// Использование промиса
fetchUserData(123)
  .then(user => {
    console.log('Пользователь получен:', user);
    return user.name; // Можно передать данные дальше
  })
  .then(name => {
    console.log('Имя пользователя:', name);
  })
  .catch(error => {
    console.error('Ошибка:', error.message);
  })
  .finally(() => {
    console.log('Запрос завершен');
  });
```

### async/await (современный подход)
```javascript
// Функция с async всегда возвращает промис
const getUserData = async (userId) => {
  try {
    const user = await fetchUserData(userId); // Ждем выполнения промиса
    console.log('Пользователь:', user);
    
    // Можем использовать обычные переменные
    const userName = user.name;
    const userEmail = user.email;
    
    return { userName, userEmail };
  } catch (error) {
    console.error('Ошибка получения пользователя:', error.message);
    return null;
  }
};

// Использование
const handleUser = async () => {
  const userData = await getUserData(123);
  if (userData) {
    console.log('Данные получены:', userData);
  }
};
```

### Параллельное выполнение
```javascript
// Последовательное выполнение (медленно)
const loadDataSequentially = async () => {
  const user = await fetchUserData(1);     // Ждем 1 секунду
  const posts = await fetchUserPosts(1);   // Ждем еще 1 секунду
  const comments = await fetchComments(1); // Ждем еще 1 секунду
  // Общее время: 3 секунды
};

// Параллельное выполнение (быстро)
const loadDataParallel = async () => {
  const [user, posts, comments] = await Promise.all([
    fetchUserData(1),
    fetchUserPosts(1), 
    fetchComments(1)
  ]);
  // Общее время: 1 секунда (самая медленная операция)
};

// Promise.allSettled - выполнить все, даже если некоторые промисы отклонены
const loadAllData = async () => {
  const results = await Promise.allSettled([
    fetchUserData(1),
    fetchUserData(-1), // Этот промис отклонится
    fetchUserData(2)
  ]);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Запрос ${index} успешен:`, result.value);
    } else {
      console.log(`Запрос ${index} провален:`, result.reason);
    }
  });
};
```

---

## Работа с API

### Что такое API
API (Application Programming Interface) - способ получения данных с сервера. В веб-разработке чаще всего используются REST API, которые возвращают данные в формате JSON.

### fetch() - современный способ запросов
```javascript
// GET запрос (получение данных)
const getUsers = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return [];
  }
};

// POST запрос (отправка данных)
const createUser = async (userData) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Ошибка создания пользователя');
    }
    
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// Использование
const loadAndDisplayUsers = async () => {
  const users = await getUsers();
  console.log('Пользователи:', users);
};
```

### Обработка разных форматов ответов
```javascript
const fetchData = async (url) => {
  const response = await fetch(url);
  
  // Проверка типа контента
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else if (contentType && contentType.includes('text/')) {
    return await response.text();
  } else {
    return await response.blob(); // Для файлов, изображений
  }
};
```

### Работа с загрузкой файлов
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', 'Описание файла');
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData // НЕ указываем Content-Type для FormData
    });
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки файла');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    throw error;
  }
};

// Обработка выбора файла
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  
  if (!file) return;
  
  try {
    const result = await uploadFile(file);
    console.log('Файл загружен:', result);
  } catch (error) {
    alert('Ошибка загрузки файла');
  }
};
```

### Практические примеры

#### Загрузка и отображение постов
```javascript
const loadPosts = async () => {
  const loadingElement = document.getElementById('loading');
  const postsContainer = document.getElementById('posts');
  
  try {
    loadingElement.style.display = 'block';
    
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await response.json();
    
    // Отображение постов
    postsContainer.innerHTML = posts
      .slice(0, 10) // Показать только первые 10
      .map(post => `
        <article class="post">
          <h3>${post.title}</h3>
          <p>${post.body}</p>
        </article>
      `)
      .join('');
      
  } catch (error) {
    postsContainer.innerHTML = '<p>Ошибка загрузки постов</p>';
  } finally {
    loadingElement.style.display = 'none';
  }
};
```

#### Поиск с задержкой (debounce)
```javascript
const setupSearch = () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('results');
  let timeout;
  
  const searchUsers = async (query) => {
    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const users = await response.json();
      
      resultsContainer.innerHTML = users
        .map(user => `
          <div class="user-result">
            <strong>${user.name}</strong>
            <span>${user.email}</span>
          </div>
        `)
        .join('');
        
    } catch (error) {
      resultsContainer.innerHTML = '<p>Ошибка поиска</p>';
    }
  };
  
  searchInput.addEventListener('input', (event) => {
    clearTimeout(timeout);
    
    // Задержка в 300ms для уменьшения количества запросов
    timeout = setTimeout(() => {
      searchUsers(event.target.value.trim());
    }, 300);
  });
};
```

#### Отправка формы с индикатором загрузки
```javascript
const setupContactForm = () => {
  const form = document.getElementById('contact-form');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Показать загрузку
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }
      
      // Успешная отправка
      showNotification('Сообщение отправлено!', 'success');
      form.reset();
      
    } catch (error) {
      showNotification('Ошибка отправки. Попробуйте позже.', 'error');
    } finally {
      // Восстановить кнопку
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
};

const showNotification = (message, type) => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Удалить через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
};
```

---

## Современные возможности ES6+

### Константы и переменные (let/const)
```javascript
// ❌ Устаревший способ
var name = 'Иван';
var name = 'Петр'; // Можно переопределить - плохо!

// ✅ Современный способ
const PI = 3.14159;        // Константа - нельзя изменить
let userName = 'Анна';     // Переменная - можно изменить
userName = 'Мария';        // ОК

const users = [];          // Константа
users.push('Иван');        // ОК - мы не переназначаем, а изменяем содержимое
```

### Шаблонные строки
```javascript
const name = 'Анна';
const age = 25;

// ❌ Старый способ
const message = 'Привет, ' + name + '! Тебе ' + age + ' лет.';

// ✅ Современный способ
const message2 = `Привет, ${name}! Тебе ${age} лет.`;

// Многострочные строки
const html = `
  <div class="user">
    <h3>${name}</h3>
    <p>Возраст: ${age}</p>
  </div>
`;

// Вычисления в шаблонах
const total = `Итого: ${price * quantity} рублей`;
```

### Стрелочные функции
```javascript
// ❌ Обычная функция
function add(a, b) {
  return a + b;
}

// ✅ Стрелочная функция
const add = (a, b) => a + b;

// Разные варианты записи
const greet = name => `Привет, ${name}!`;           // Один параметр
const sayHello = () => console.log('Привет!');      // Без параметров
const double = x => x * 2;                          // Простое выражение

// Для сложной логики
const processUser = (user) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  return fullName.toUpperCase();
};
```

### Деструктуризация
```javascript
// Деструктуризация объектов
const user = { name: 'Анна', age: 25, city: 'Москва' };

// ❌ Старый способ
const name = user.name;
const age = user.age;

// ✅ Современный способ
const { name, age, city } = user;

// С переименованием
const { name: userName, age: userAge } = user;

// Со значениями по умолчанию
const { name, age, country = 'Россия' } = user;

// Деструктуризация массивов
const colors = ['красный', 'синий', 'зеленый'];
const [first, second, third] = colors;
const [red, , green] = colors; // Пропуск элементов
```

### Spread оператор (...)
```javascript
// Копирование массивов
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]

// Объединение массивов
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4]

// Копирование объектов
const user = { name: 'Анна', age: 25 };
const updatedUser = { ...user, city: 'Москва' }; // Добавить свойство
const olderUser = { ...user, age: 26 };          // Изменить свойство

// Передача аргументов в функцию
const numbers2 = [1, 5, 3, 9, 2];
const max = Math.max(...numbers2); // Вместо Math.max.apply(null, numbers)
```

### Деструктуризация в параметрах функций
```javascript
// Деструктуризация объекта в параметрах
const showUserInfo = ({ name, age, email }) => {
  console.log(`${name}, ${age} лет, ${email}`);
};

const user = { name: 'Иван', age: 30, email: 'ivan@mail.ru' };
showUserInfo(user);

// Со значениями по умолчанию
const createUser = ({ name, age = 18, city = 'Москва' }) => {
  return { name, age, city };
};

// Деструктуризация массива в параметрах
const getCoordinates = ([x, y]) => {
  return `Координаты: x=${x}, y=${y}`;
};

getCoordinates([10, 20]);
```

### Сокращенная запись свойств объектов
```javascript
const name = 'Анна';
const age = 25;

// ❌ Старый способ
const user = {
  name: name,
  age: age,
  greet: function() {
    return 'Привет!';
  }
};

// ✅ Современный способ
const user2 = {
  name,        // Сокращение для name: name
  age,         // Сокращение для age: age
  greet() {    // Сокращение для greet: function()
    return 'Привет!';
  }
};
```

### Array методы
```javascript
const users = [
  { name: 'Анна', age: 25, active: true },
  { name: 'Петр', age: 30, active: false },
  { name: 'Мария', age: 22, active: true }
];

// find - найти первый подходящий элемент
const anna = users.find(user => user.name === 'Анна');

// findIndex - найти индекс элемента
const annaIndex = users.findIndex(user => user.name === 'Анна');

// some - проверить, есть ли хотя бы один подходящий элемент
const hasActiveUsers = users.some(user => user.active);

// every - проверить, что все элементы подходят
const allActive = users.every(user => user.active);

// includes - проверить наличие элемента (для примитивов)
const numbers = [1, 2, 3, 4, 5];
const hasThree = numbers.includes(3);
```

### Модули (import/export)
```javascript
// math.js - экспорт функций
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

export default function subtract(a, b) {
  return a - b;
}

// main.js - импорт функций
import subtract, { add, multiply } from './math.js';

// Использование
const sum = add(5, 3);
const product = multiply(4, 7);
const difference = subtract(10, 3);

// Импорт всего как объект
import * as Math from './math.js';
const result = Math.add(2, 3);
```

### Классы (упрощенный синтаксис)
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  greet() {
    return `Привет, я ${this.name}!`;
  }
  
  getInfo() {
    return {
      name: this.name,
      email: this.email
    };
  }
}

// Использование
const user = new User('Анна', 'anna@mail.ru');
console.log(user.greet()); // "Привет, я Анна!"

// Наследование
class Admin extends User {
  constructor(name, email, permissions) {
    super(name, email); // Вызов конструктора родителя
    this.permissions = permissions;
  }
  
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
}

const admin = new Admin('Иван', 'admin@mail.ru', ['read', 'write', 'delete']);
```

---

## Заключение

Этот конспект охватывает основы современного JavaScript, необходимые для создания интерактивных веб-сайтов. Помните основные принципы:

### ✅ Лучшие практики
- **Используйте современный синтаксис** - `const`/`let`, arrow functions, деструктуризация
- **Называйте переменные понятно** - `userName` лучше чем `u`
- **Проверяйте данные** - валидируйте формы, обрабатывайте ошибки API
- **Используйте async/await** для асинхронного кода
- **Делегируйте события** вместо множества обработчиков

### ❌ Чего избегать
- `var` - используйте `const`/`let`
- Глобальных переменных - группируйте код в функции
- Синхронных запросов - используйте `fetch()` с `async/await`
- Прямого изменения innerHTML с пользовательскими данными
- Забывания `preventDefault()` в обработчиках форм

### 📚 Полезные ресурсы
- **Документация:** [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/JavaScript)
- **Обучение:** [learn.javascript.ru](https://learn.javascript.ru/)
- **Песочницы:** [codepen.io](https://codepen.io/), [jsfiddle.net](https://jsfiddle.net/)
- **Инструменты разработчика:** F12 в браузере