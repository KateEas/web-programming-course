# JavaScript - Практическая шпаргалка

## Справочная информация
**Основной справочник:** [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/JavaScript)  
**Интерактивное обучение:** [learn.javascript.ru](https://learn.javascript.ru/)  
**Песочница:** [codepen.io](https://codepen.io/), [jsfiddle.net](https://jsfiddle.net/)

---

## Самые нужные основы

### Переменные (современный способ)
```javascript
const siteName = 'Моя компания';      // Константа (нельзя изменить)
let userName = 'Анна';                // Переменная (можно изменить)
let isMenuOpen = false;               // Логическое значение

// ❌ Не используйте var - устарело
```

### Основные операции
```javascript
// Работа со строками
const firstName = 'Анна';
const lastName = 'Иванова';
const fullName = `${firstName} ${lastName}`;     // "Анна Иванова"
const email = 'ANNA@MAIL.RU'.toLowerCase();      // "anna@mail.ru"
const hasAt = email.includes('@');               // true

// Работа с числами
const price = 1500;
const discount = 0.1;
const finalPrice = price * (1 - discount);      // 1350
const rounded = Math.round(3.7);                 // 4
const random = Math.floor(Math.random() * 10);  // 0-9

// Проверки
const age = 25;
const isAdult = age >= 18;                       // true
const isEmpty = !userName;                       // false (если userName = 'Анна')
```

---

## Поиск и изменение элементов страницы

### Поиск элементов
```javascript
// Основные способы (используйте эти)
const header = document.getElementById('header');
const button = document.querySelector('.btn');
const allButtons = document.querySelectorAll('.btn');
const menuItems = document.querySelectorAll('nav ul li');

// Проверка существования элемента
if (header) {
  // Элемент найден, можно работать
}
```

### Изменение содержимого
```javascript
const title = document.getElementById('title');

title.textContent = 'Новый заголовок';           // Изменить текст
title.innerHTML = '<strong>Жирный</strong>';     // Изменить HTML

// Для пользовательских данных используйте textContent!
const userInput = document.getElementById('name').value;
title.textContent = userInput;  // Безопасно
```

### Работа с классами CSS
```javascript
const menu = document.getElementById('menu');

menu.classList.add('open');           // Добавить класс
menu.classList.remove('hidden');     // Удалить класс  
menu.classList.toggle('active');     // Переключить класс
menu.classList.contains('open');     // Проверить наличие класса

// Показать/скрыть элемент
menu.style.display = 'none';         // Скрыть
menu.style.display = 'block';        // Показать
```

### Изменение атрибутов
```javascript
const link = document.querySelector('a');

link.href = 'https://example.com';
link.target = '_blank';
link.setAttribute('download', 'file.pdf');
link.removeAttribute('target');
```

---

## События - реакция на действия пользователя

### Обработка кликов
```javascript
const button = document.getElementById('menu-btn');

button.addEventListener('click', () => {
  const menu = document.getElementById('menu');
  menu.classList.toggle('open');
});

// Клик с передачей данных
const toggleSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  section.classList.toggle('hidden');
};

// Использование в HTML: <button onclick="toggleSection('about')">
```

### Работа с формами
```javascript
const form = document.getElementById('contact-form');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Отменить стандартную отправку
  
  // Получить данные
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  
  // Простая проверка
  if (!name || !email) {
    alert('Заполните все поля');
    return;
  }
  
  // Отправить данные (пример)
  console.log('Отправляем:', { name, email });
});
```

### Отслеживание ввода в реальном времени
```javascript
const searchInput = document.getElementById('search');
const counter = document.getElementById('char-counter');

searchInput.addEventListener('input', (event) => {
  const text = event.target.value;
  const remaining = 100 - text.length;
  counter.textContent = `Осталось: ${remaining} символов`;
});
```

---

## Функции - группировка кода

### Современный синтаксис
```javascript
// Простые функции
const greet = (name) => `Привет, ${name}!`;
const add = (a, b) => a + b;
const showAlert = () => alert('Привет!');

// Сложные функции
const validateEmail = (email) => {
  const isValid = email.includes('@') && email.includes('.');
  return isValid;
};

const formatPrice = (price) => {
  return `${price.toLocaleString()} ₽`;
};
```

### Функции для сайта
```javascript
// Плавная прокрутка к секции
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: 'smooth' });
};

// Показ/скрытие модального окна
const showModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
};

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
  document.body.style.overflow = '';
};

// Переключение темы сайта
const toggleTheme = () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};
```

---

## Работа с массивами и объектами

### Массивы - списки данных
```javascript
const fruits = ['яблоко', 'банан', 'апельсин'];

// Основные операции
fruits.push('киви');              // Добавить в конец
fruits.unshift('манго');          // Добавить в начало
const last = fruits.pop();       // Удалить последний
const first = fruits.shift();    // Удалить первый

// Полезные методы
const hasBanana = fruits.includes('банан');           // true
const appleIndex = fruits.indexOf('яблоко');         // 0 или -1

// Перебор элементов
fruits.forEach(fruit => console.log(fruit));

// Создание нового массива
const uppercased = fruits.map(fruit => fruit.toUpperCase());
const longFruits = fruits.filter(fruit => fruit.length > 5);
```

### Объекты - группировка данных
```javascript
const user = {
  name: 'Анна',
  email: 'anna@mail.ru',
  age: 25
};

// Доступ к свойствам
console.log(user.name);           // "Анна"
console.log(user['email']);       // "anna@mail.ru"

// Изменение свойств
user.age = 26;
user.city = 'Москва';            // Добавить новое свойство

// Современное извлечение данных
const { name, email } = user;    // name = "Анна", email = "anna@mail.ru"
```

---

## Условия и циклы

### Условия
```javascript
const age = 20;

// Простое условие
if (age >= 18) {
  console.log('Совершеннолетний');
} else {
  console.log('Несовершеннолетний');
}

// Краткая запись
const status = age >= 18 ? 'взрослый' : 'ребенок';

// Практический пример
const menuButton = document.getElementById('menu-btn');
const menu = document.getElementById('menu');

if (menu.classList.contains('open')) {
  menu.classList.remove('open');
  menuButton.textContent = 'Открыть меню';
} else {
  menu.classList.add('open');
  menuButton.textContent = 'Закрыть меню';
}
```

### Циклы
```javascript
// Перебор массива (современный способ)
const products = ['телефон', 'ноутбук', 'планшет'];

for (const product of products) {
  console.log(product);
}

// Создание списка в HTML
const productList = document.getElementById('products');
let html = '';

for (const product of products) {
  html += `<li>${product}</li>`;
}

productList.innerHTML = html;
```

---

## Работа с сервером (API)

### Получение данных
```javascript
const loadUsers = async () => {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    
    displayUsers(users);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    showError('Не удалось загрузить данные');
  }
};

const displayUsers = (users) => {
  const container = document.getElementById('users');
  const html = users.map(user => `
    <div class="user">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
    </div>
  `).join('');
  
  container.innerHTML = html;
};
```

### Отправка формы
```javascript
const sendContactForm = async (formData) => {
  const submitButton = document.querySelector('button[type="submit"]');
  
  try {
    // Показать загрузку
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      showSuccess('Сообщение отправлено!');
      form.reset();
    } else {
      showError('Ошибка отправки');
    }
    
  } catch (error) {
    showError('Ошибка сети');
  } finally {
    // Восстановить кнопку
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить';
  }
};
```

---

## Частые задачи и решения

### Валидация email
```javascript
const isValidEmail = (email) => {
  return email.includes('@') && email.includes('.') && email.length > 5;
};

// Использование
const email = 'user@example.com';
if (isValidEmail(email)) {
  console.log('Email корректный');
}
```

### Форматирование данных
```javascript
// Форматирование цены
const formatPrice = (price) => `${price.toLocaleString()} ₽`;

// Форматирование даты
const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(date));
};

// Обрезание длинного текста
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};
```

### Сохранение данных в браузере
```javascript
// Сохранить настройки
const saveSettings = (settings) => {
  localStorage.setItem('userSettings', JSON.stringify(settings));
};

// Загрузить настройки
const loadSettings = () => {
  const saved = localStorage.getItem('userSettings');
  return saved ? JSON.parse(saved) : {};
};

// Пример использования
const settings = { theme: 'dark', language: 'ru' };
saveSettings(settings);

const currentSettings = loadSettings();
if (currentSettings.theme === 'dark') {
  document.body.classList.add('dark-theme');
}
```

### Задержка выполнения (debounce)
```javascript
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Поиск с задержкой
const searchInput = document.getElementById('search');
const performSearch = (query) => {
  console.log('Ищем:', query);
};

const debouncedSearch = debounce(performSearch, 300);

searchInput.addEventListener('input', (event) => {
  debouncedSearch(event.target.value);
});
```

### Случайные числа и выбор
```javascript
// Случайное число от min до max
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Случайный элемент из массива
const randomChoice = (array) => {
  return array[randomInt(0, array.length - 1)];
};

// Использование
const dice = randomInt(1, 6);
const colors = ['red', 'blue', 'green'];
const randomColor = randomChoice(colors);
```

---

## Полезные паттерны для сайтов

### Аккордеон
```javascript
const setupAccordion = () => {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isOpen = content.style.display === 'block';
      
      // Закрыть все другие
      document.querySelectorAll('.accordion-content').forEach(item => {
        item.style.display = 'none';
      });
      
      // Переключить текущий
      content.style.display = isOpen ? 'none' : 'block';
    });
  });
};
```

### Табы
```javascript
const setupTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Убрать активный класс у всех
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Активировать нужные
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
};
```

### Слайдер/карусель (простая)
```javascript
const setupSlider = () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  let currentSlide = 0;
  
  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  };
  
  prevBtn.addEventListener('click', () => {
    currentSlide = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
    showSlide(currentSlide);
  });
  
  nextBtn.addEventListener('click', () => {
    currentSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
    showSlide(currentSlide);
  });
};
```

### Бесконечная прокрутка
```javascript
const setupInfiniteScroll = () => {
  let page = 1;
  let loading = false;
  
  window.addEventListener('scroll', async () => {
    if (loading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loading = true;
      
      try {
        const response = await fetch(`/api/posts?page=${page}`);
        const posts = await response.json();
        
        appendPosts(posts);
        page++;
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        loading = false;
      }
    }
  });
};
```

---

## Быстрая справка

### ✅ Современный синтаксис
- `const`/`let` вместо `var`
- Arrow functions: `() => {}`
- Template strings: `${variable}`
- Деструктуризация: `const { name } = user`

### ✅ Лучшие практики
- Всегда проверяйте существование элементов: `if (element) { ... }`
- Используйте `textContent` для пользовательских данных
- Обрабатывайте ошибки в `try/catch`
- Добавляйте `event.preventDefault()` в обработчики форм

### ❌ Чего избегать
- `var` - используйте `const`/`let`
- `innerHTML` с пользовательскими данными
- Глобальных переменных
- Синхронных операций

### 🔧 Отладка
- `console.log(переменная)` - вывести значение
- F12 → Console - консоль браузера
- `debugger;` - поставить точку останова