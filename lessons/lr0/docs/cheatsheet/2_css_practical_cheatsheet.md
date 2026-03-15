# CSS - Практическая шпаргалка

## Справочная информация
**Основной справочник:** [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/CSS)  
**Flexbox Guide:** [css-tricks.com/snippets/css/a-guide-to-flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)  
**Grid Guide:** [css-tricks.com/snippets/css/complete-guide-grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

## Подключение CSS

```html
<!-- Внешний файл (рекомендуется) -->
<link rel="stylesheet" href="style.css">

<!-- Внутренние стили -->
<style>
  .my-class { color: red; }
</style>
```

---

## Основные селекторы

```css
/* По тегу */
p { color: black; }

/* По классу */
.button { background: blue; }
.red-text { color: red; }

/* По ID */
#header { background: white; }

/* Комбинации */
.header .logo { width: 100px; }    /* Потомок */
.navbar > li { list-style: none; } /* Прямой потомок */
h2 + p { margin-top: 0; }          /* Соседний элемент */

/* Псевдоклассы */
a:hover { color: red; }
button:focus { outline: 2px solid blue; }
li:first-child { font-weight: bold; }
tr:nth-child(even) { background: #f0f0f0; }
```

---

## Цвета и размеры

### Цвета
```css
.colors {
  color: red;                    /* Именованный */
  color: #ff0000;               /* HEX */
  color: #f00;                  /* Короткий HEX */
  color: rgb(255, 0, 0);        /* RGB */
  color: rgba(255, 0, 0, 0.5);  /* RGB с прозрачностью */
  color: hsl(0, 100%, 50%);     /* HSL */
}
```

### Размеры
```css
.sizes {
  width: 300px;        /* Пиксели */
  width: 50%;          /* Проценты */
  width: 20rem;        /* Относительно корневого шрифта */
  width: 2em;          /* Относительно шрифта элемента */
  width: 50vw;         /* 50% ширины экрана */
  height: 100vh;       /* 100% высоты экрана */
  
  /* Современные функции */
  width: min(90%, 1200px);              /* Меньшее значение */
  width: clamp(300px, 50%, 800px);      /* Ограниченное значение */
}
```

---

## Блочная модель

### Box-sizing (применить ко всем элементам)
```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

### Отступы и границы
```css
.spacing {
  /* Отступы */
  margin: 20px;                    /* Все стороны */
  margin: 10px 20px;              /* Вертикально | Горизонтально */
  margin: 10px 15px 20px 5px;     /* Верх | Право | Низ | Лево */
  padding: 15px;                   /* Внутренние отступы */
  
  /* Центрирование */
  margin: 0 auto;                  /* Горизонтальное центрирование */
  
  /* Границы */
  border: 1px solid #ddd;
  border-radius: 8px;              /* Скругленные углы */
  border-top: 2px solid blue;      /* Только верхняя граница */
  
  /* Тени */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

---

## Текст и шрифты

```css
.typography {
  /* Основные свойства */
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: bold;              /* normal, bold, 100-900 */
  line-height: 1.5;               /* Межстрочный интервал */
  
  /* Выравнивание и декорация */
  text-align: center;             /* left, center, right, justify */
  text-decoration: none;          /* none, underline, line-through */
  text-transform: uppercase;      /* uppercase, lowercase, capitalize */
  
  /* Адаптивный размер */
  font-size: clamp(1rem, 2.5vw, 2rem);
}

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

.custom-font {
  font-family: 'Roboto', sans-serif;
}
```

---

## Позиционирование

```css
/* Типы позиционирования */
.positioning {
  position: static;     /* По умолчанию */
  position: relative;   /* Относительно своей позиции */
  position: absolute;   /* Относительно positioned родителя */
  position: fixed;      /* Относительно окна браузера */
  position: sticky;     /* Липкое позиционирование */
  
  top: 10px;
  right: 20px;
  bottom: 30px;
  left: 40px;
  z-index: 100;         /* Порядок слоев */
}

/* Центрирование */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## Flexbox (для одномерных макетов)

### Flex-контейнер
```css
.flex-container {
  display: flex;
  
  /* Направление */
  flex-direction: row;        /* row, column, row-reverse, column-reverse */
  flex-wrap: wrap;           /* nowrap, wrap, wrap-reverse */
  
  /* Выравнивание по главной оси */
  justify-content: center;    /* flex-start, center, flex-end, space-between, space-around, space-evenly */
  
  /* Выравнивание по поперечной оси */
  align-items: center;        /* stretch, flex-start, center, flex-end, baseline */
  
  gap: 1rem;                 /* Отступы между элементами */
}
```

### Flex-элементы
```css
.flex-item {
  flex: 1;                   /* Занять доступное место */
  flex: 0 0 200px;          /* Не расти, не сжиматься, базовый размер 200px */
  flex-grow: 1;             /* Способность расти */
  flex-shrink: 0;           /* Способность сжиматься */
  flex-basis: 200px;        /* Базовый размер */
  
  align-self: flex-end;     /* Индивидуальное выравнивание */
}
```

### Практические примеры Flexbox
```css
/* Навигация */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* Центрирование */
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Карточки */
.cards {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.card {
  flex: 1 1 300px;          /* Минимум 300px, растет */
}
```

---

## CSS Grid (для двумерных макетов)

### Grid-контейнер
```css
.grid-container {
  display: grid;
  
  /* Колонки */
  grid-template-columns: 1fr 2fr 1fr;                    /* 3 колонки */
  grid-template-columns: repeat(3, 1fr);                 /* 3 равные колонки */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Адаптивные колонки */
  
  /* Строки */
  grid-template-rows: auto 1fr auto;                     /* Шапка, контент, подвал */
  
  gap: 1rem;                                            /* Отступы между ячейками */
  
  /* Именованные области */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
```

### Grid-элементы
```css
.grid-item {
  /* Размещение по линиям */
  grid-column: 1 / 3;        /* Занять колонки 1-2 */
  grid-row: 2 / 4;           /* Занять строки 2-3 */
  
  /* Занять количество ячеек */
  grid-column: span 2;       /* Занять 2 колонки */
  grid-row: span 3;          /* Занять 3 строки */
  
  /* Именованные области */
  grid-area: header;
}
```

### Практические примеры Grid
```css
/* Макет сайта */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }

/* Галерея */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* Форма */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-grid .full-width {
  grid-column: 1 / -1;       /* На всю ширину */
}
```

---

## Адаптивная верстка

### Медиа-запросы
```css
/* Мобильные (по умолчанию) */
.container {
  padding: 1rem;
}

/* Планшеты */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Десктопы */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 3rem;
  }
}

/* Только планшеты */
@media (min-width: 768px) and (max-width: 1023px) {
  .tablet-only {
    display: block;
  }
}
```

### Адаптивные изображения
```css
.responsive-img {
  max-width: 100%;
  height: auto;
}

/* С объектным заполнением */
.cover-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}
```

---

## Анимации и переходы

### Переходы
```css
.transition {
  transition: all 0.3s ease;
  transition: transform 0.2s, opacity 0.3s;
}

/* Hover эффекты */
.button {
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
```

### Анимации
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-up {
  animation: slideUp 0.6s ease-out;
}

/* Загрузочный спиннер */
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## CSS переменные

```css
:root {
  /* Цвета */
  --primary: #007bff;
  --secondary: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  --white: #ffffff;
  --dark: #343a40;
  
  /* Размеры */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  
  /* Отступы */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Прочее */
  --border-radius: 0.375rem;
  --transition: all 0.3s ease;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* Использование */
.button {
  background: var(--primary);
  color: var(--white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

/* Темная тема */
[data-theme="dark"] {
  --primary: #4dabf7;
  --white: #1a1a1a;
  --dark: #ffffff;
}
```

---

## Полезные классы-утилиты

```css
/* Отображение */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }

/* Позиционирование */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

/* Выравнивание текста */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Flexbox утилиты */
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.flex-col { flex-direction: column; }

/* Отступы */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-4 { margin: 1rem; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }

/* Ширина */
.w-full { width: 100%; }
.w-1\/2 { width: 50%; }
.w-1\/3 { width: 33.333333%; }
.w-1\/4 { width: 25%; }

/* Высота */
.h-full { height: 100%; }
.h-screen { height: 100vh; }

/* Цвета фона */
.bg-primary { background-color: var(--primary); }
.bg-white { background-color: var(--white); }
.bg-gray { background-color: #f8f9fa; }

/* Цвета текста */
.text-primary { color: var(--primary); }
.text-white { color: var(--white); }
.text-dark { color: var(--dark); }
```

---

## Готовые компоненты

### Кнопка
```css
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--secondary);
  color: var(--white);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: var(--white);
}
```

### Карточка
```css
.card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-header,
.card-body,
.card-footer {
  padding: var(--spacing-md);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-footer {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}
```

### Модальное окно
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  z-index: 1000;
}

.modal.open {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: var(--white);
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.8);
  transition: var(--transition);
}

.modal.open .modal-content {
  transform: scale(1);
}
```

---

## Быстрая справка

### ✅ Современный подход
- `display: flex` или `display: grid` для макетов
- `clamp()`, `min()`, `max()` для адаптивных размеров
- CSS переменные для цветов и констант
- `box-sizing: border-box` для всех элементов

### ✅ Лучшие практики
- Mobile-first подход в медиа-запросах
- Семантичные имена классов
- Группировка CSS по компонентам
- Использование относительных единиц измерения

### ❌ Чего избегать
- `float` для макетов
- `!important` без крайней необходимости
- Фиксированные размеры в пикселях
- Глубокая вложенность селекторов

### 🔧 Отладка CSS
- F12 → Elements → Styles - редактирование в реальном времени
- Outline для всех элементов: `* { outline: 1px solid red; }`
- Проверка специфичности селекторов