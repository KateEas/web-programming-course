# Конспект по CSS

## Справочная информация
**Основной справочник:** [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/CSS)  
**Интерактивное обучение:** [htmlacademy.ru](https://htmlacademy.ru/)  
**Генераторы:** [cssgenerator.org](https://cssgenerator.org/), [caniuse.com](https://caniuse.com/)

## Содержание
1. [О CSS](#о-css)
2. [Основы синтаксиса](#основы-синтаксиса) 
3. [Селекторы](#селекторы)
4. [Цвета и единицы](#цвета-и-единицы-измерения)
5. [Текст и шрифты](#текст-и-шрифты)
6. [Блочная модель](#блочная-модель)
7. [Позиционирование](#позиционирование)
8. [Flexbox](#flexbox)
9. [CSS Grid](#css-grid)
10. [Адаптивная верстка](#адаптивная-верстка)
11. [Анимации](#анимации-и-переходы)
12. [Современные возможности](#современные-возможности)

---

## О CSS

### Что такое CSS
CSS (Cascading Style Sheets) - язык стилей для оформления HTML-страниц. Он отвечает за **внешний вид**: цвета, размеры, расположение элементов, анимации.

### Способы подключения CSS

```html
<!-- Внешний файл (рекомендуется) -->
<link rel="stylesheet" href="style.css">

<!-- Внутренние стили -->
<style>
  body { background-color: #f0f0f0; }
</style>

<!-- Инлайновые стили (избегайте) -->
<div style="color: red;">Текст</div>
```

### Приоритеты CSS
1. **Инлайновые стили** (`style=""`) - высший приоритет
2. **ID селекторы** (`#header`)
3. **Классы** (`.button`) и атрибуты
4. **Теги** (`div`, `p`)

---

## Основы синтаксиса

### Структура CSS правила
```css
селектор {
  свойство: значение;
  другое-свойство: значение;
}
```

### Комментарии
```css
/* Комментарий в CSS */
/*
  Многострочный
  комментарий
*/
```

### Группировка селекторов
```css
/* Одинаковые стили для разных элементов */
h1, h2, h3 {
  color: #333;
  font-family: Arial, sans-serif;
}
```

---

## Селекторы

### Основные селекторы

```css
/* По тегу */
p { color: black; }
div { margin: 10px; }

/* По классу */
.button { background: blue; }
.big-text { font-size: 1.5rem; }

/* По ID */
#header { background: #f0f0f0; }
#main-content { max-width: 1200px; }
```

### Комбинаторы

```css
/* Потомок (пробел) - все p внутри .content */
.content p {
  line-height: 1.6;
}

/* Прямой потомок (>) - только прямые дочерние */
ul > li {
  list-style: none;
}

/* Соседний элемент (+) - p сразу после h2 */
h2 + p {
  margin-top: 0;
}
```

### Псевдоклассы

```css
/* Состояния ссылок */
a:link { color: blue; }
a:visited { color: purple; }
a:hover { color: red; }
a:focus { outline: 2px solid blue; }

/* Кнопки */
button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

/* Структурные */
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
tr:nth-child(even) { background: #f0f0f0; }
```

### Псевдоэлементы

```css
/* Первая буква */
p:first-letter {
  font-size: 2rem;
  font-weight: bold;
}

/* Добавление контента */
.icon::before {
  content: "★";
  color: gold;
}

.link::after {
  content: " →";
}
```

---

## Цвета и единицы измерения

### Способы задания цветов

```css
.color-examples {
  /* Именованные цвета */
  color: red;
  color: blue;
  
  /* HEX */
  color: #ff0000;    /* Красный */
  color: #333;       /* Серый */
  
  /* RGB */
  color: rgb(255, 0, 0);
  color: rgba(255, 0, 0, 0.5);  /* С прозрачностью */
  
  /* HSL */
  color: hsl(0, 100%, 50%);     /* Красный */
  color: hsla(120, 100%, 50%, 0.8);
}
```

### Единицы измерения

```css
.units-examples {
  /* Абсолютные */
  width: 300px;      /* Пиксели */
  height: 2cm;       /* Сантиметры */
  
  /* Относительные */
  padding: 1em;      /* Относительно шрифта элемента */
  margin: 0.5rem;    /* Относительно корневого шрифта */
  width: 50%;        /* Относительно родителя */
  
  /* Viewport единицы */
  width: 50vw;       /* 50% ширины окна */
  height: 100vh;     /* 100% высоты окна */
  
  /* Современные функции */
  width: min(50vw, 600px);     /* Меньшее значение */
  width: max(300px, 30%);      /* Большее значение */
  width: clamp(300px, 50%, 800px); /* Ограниченное */
}
```

---

## Текст и шрифты

### Основные свойства

```css
.typography {
  /* Шрифт */
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: bold;      /* 400 = normal, 700 = bold */
  font-style: italic;
  line-height: 1.5;
  
  /* Текст */
  text-align: center;
  text-decoration: underline;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  word-spacing: 0.2em;
}
```

### Веб-шрифты

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
```

```css
/* Использование */
body {
  font-family: 'Roboto', sans-serif;
}

/* Локальные шрифты */
@font-face {
  font-family: 'MyFont';
  src: url('fonts/myfont.woff2') format('woff2');
  font-display: swap;
}
```

### Современная типографика

```css
.modern-text {
  /* Адаптивный размер */
  font-size: clamp(1rem, 2.5vw, 2rem);
  
  /* Сглаживание */
  -webkit-font-smoothing: antialiased;
  
  /* Перенос слов */
  word-break: break-word;
  hyphens: auto;
}
```

---

## Блочная модель

### Понимание блочной модели

```css
.box-example {
  width: 300px;           /* Ширина содержимого */
  height: 200px;          /* Высота содержимого */
  padding: 20px;          /* Внутренние отступы */
  border: 2px solid #333; /* Граница */
  margin: 10px;           /* Внешние отступы */
  
  /* Итоговая ширина: 300 + 20*2 + 2*2 + 10*2 = 364px */
}
```

### Современный подход

```css
/* Применить ко всем элементам */
*, *::before, *::after {
  box-sizing: border-box;
}

.modern-box {
  box-sizing: border-box;
  width: 300px;     /* Общая ширина включая padding и border */
  padding: 20px;
  border: 2px solid #333;
  /* Итоговая ширина: ровно 300px */
}
```

### Отступы

```css
.spacing {
  /* Все стороны */
  margin: 20px;
  padding: 15px;
  
  /* Вертикально | Горизонтально */
  margin: 10px 20px;
  
  /* Верх | Горизонтально | Низ */
  margin: 10px 20px 15px;
  
  /* Верх | Право | Низ | Лево */
  margin: 10px 15px 20px 5px;
  
  /* Центрирование */
  width: 300px;
  margin: 0 auto;
}
```

### Границы и тени

```css
.borders-shadows {
  /* Границы */
  border: 2px solid #333;
  border-radius: 10px;
  border-top: 1px solid #ddd;
  
  /* Тени */
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  
  /* Тень текста */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
```

---

## Позиционирование

### Типы позиционирования

```css
/* Static - по умолчанию */
.static {
  position: static;
}

/* Relative - смещение от исходной позиции */
.relative {
  position: relative;
  top: 10px;
  left: 20px;
}

/* Absolute - относительно ближайшего positioned предка */
.absolute {
  position: absolute;
  top: 50px;
  right: 20px;
}

/* Fixed - относительно окна браузера */
.fixed {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
}

/* Sticky - липкое позиционирование */
.sticky {
  position: sticky;
  top: 20px;
}
```

### Центрирование

```css
/* Горизонтальное центрирование блока */
.center-block {
  width: 300px;
  margin: 0 auto;
}

/* Полное центрирование с absolute */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* С flexbox */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

## Flexbox

### Flex-контейнер

```css
.flex-container {
  display: flex;
  
  /* Направление */
  flex-direction: row;        /* По умолчанию */
  flex-direction: column;
  flex-direction: row-reverse;
  
  /* Перенос */
  flex-wrap: nowrap;          /* По умолчанию */
  flex-wrap: wrap;
  
  /* Сокращение */
  flex-flow: row wrap;
}
```

### Выравнивание

```css
.flex-alignment {
  display: flex;
  
  /* По главной оси */
  justify-content: flex-start;    /* К началу */
  justify-content: center;        /* По центру */
  justify-content: space-between; /* Равномерно */
  justify-content: space-around;  /* С отступами */
  
  /* По поперечной оси */
  align-items: stretch;      /* Растянуть */
  align-items: center;       /* По центру */
  align-items: flex-start;   /* К началу */
  align-items: flex-end;     /* К концу */
}
```

### Flex-элементы

```css
.flex-item {
  /* Рост, сжатие, базовый размер */
  flex-grow: 1;       /* Занять доступное место */
  flex-shrink: 0;     /* Не сжиматься */
  flex-basis: 200px;  /* Базовый размер */
  
  /* Сокращение */
  flex: 1;            /* flex: 1 1 0 */
  flex: 0 0 200px;    /* Фиксированный размер */
  
  /* Индивидуальное выравнивание */
  align-self: center;
}
```

### Практические примеры

```css
/* Навигация */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.navbar .nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* Карточки одинаковой высоты */
.cards {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.card {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
}

.card-footer {
  margin-top: auto;  /* Прижать к низу */
}
```

---

## CSS Grid

### Основы Grid

```css
.grid-container {
  display: grid;
  
  /* Колонки */
  grid-template-columns: 200px 1fr 100px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  
  /* Строки */
  grid-template-rows: auto 1fr auto;
  
  /* Отступы */
  gap: 1rem;
  row-gap: 2rem;
  column-gap: 1rem;
}
```

### Именованные области

```css
.layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### Позиционирование элементов

```css
.grid-item {
  /* По линиям */
  grid-column: 1 / 3;     /* Занять колонки 1-2 */
  grid-row: 2 / 4;        /* Занять строки 2-3 */
  
  /* Занять количество ячеек */
  grid-column: span 2;    /* Занять 2 колонки */
  grid-row: span 3;       /* Занять 3 строки */
}
```

### Практические примеры

```css
/* Адаптивная галерея */
.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  grid-auto-rows: 200px;
}

.photo-item.large {
  grid-column: span 2;
  grid-row: span 2;
}

/* Макет сайта */
.site-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .site-layout {
    grid-template-areas:
      "header"
      "main" 
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

---

## Адаптивная верстка

### Медиа-запросы

```css
/* Базовые стили для мобильных */
.container {
  width: 100%;
  padding: 1rem;
}

/* Планшеты */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
    padding: 2rem;
  }
}

/* Десктопы */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 3rem;
  }
}
```

### Типичные брейкпоинты

```css
/* Мобильные (по умолчанию) */
.responsive {
  font-size: 14px;
}

/* Планшеты */
@media (min-width: 768px) {
  .responsive {
    font-size: 16px;
  }
}

/* Ноутбуки */
@media (min-width: 1024px) {
  .responsive {
    font-size: 18px;
  }
}

/* Большие экраны */
@media (min-width: 1200px) {
  .responsive {
    font-size: 20px;
  }
}
```

### Сложные медиа-запросы

```css
/* Диапазон размеров */
@media (min-width: 768px) and (max-width: 1023px) {
  .tablet-only {
    display: block;
  }
}

/* Ориентация */
@media (orientation: landscape) {
  .landscape {
    flex-direction: row;
  }
}

/* Предпочтения пользователя */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: white;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Адаптивные единицы

```css
.responsive-sizing {
  /* Адаптивный размер шрифта */
  font-size: clamp(1rem, 2.5vw, 3rem);
  
  /* Адаптивная ширина */
  width: min(90%, 1200px);
  
  /* Viewport единицы */
  height: 100vh;
  width: 50vw;
  
  /* Новые viewport единицы */
  height: 100dvh;  /* Dynamic viewport height */
}
```

### Адаптивные изображения

```css
.responsive-image {
  max-width: 100%;
  height: auto;
  
  /* Объектное заполнение */
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}
```

---

## Анимации и переходы

### CSS Transitions

```css
.transition-element {
  background: #007bff;
  transition: all 0.3s ease;
}

.transition-element:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Детальная настройка */
.detailed-transition {
  transition-property: transform, opacity;
  transition-duration: 0.3s, 0.5s;
  transition-timing-function: ease-out;
  transition-delay: 0.1s;
}
```

### CSS Animations

```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animated {
  animation: slideIn 1s ease-out;
}

.bounce {
  animation: bounce 2s infinite;
}
```

### Transform

```css
.transform-examples {
  /* Перемещение */
  transform: translateX(50px);
  transform: translate(50px, -20px);
  
  /* Масштабирование */
  transform: scale(1.2);
  transform: scaleX(2);
  
  /* Поворот */
  transform: rotate(45deg);
  transform: rotateX(30deg);
  
  /* Комбинирование */
  transform: translateX(50px) rotate(45deg) scale(1.2);
  
  /* Точка трансформации */
  transform-origin: center;
  transform-origin: top left;
}
```

### Практические примеры

```css
/* Загрузочный спиннер */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Плавное появление */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeInUp 0.6s ease-out;
}

/* Hover эффекты */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
```

---

## Современные возможности

### CSS Custom Properties (переменные)

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 1rem;
  --spacing-md: 1rem;
  --border-radius: 0.375rem;
  --transition: all 0.3s ease;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.button:hover {
  background: var(--primary-color, #0056b3); /* Fallback */
}

/* Темная тема */
[data-theme="dark"] {
  --primary-color: #4dabf7;
  --background: #1a1a1a;
  --text-color: #ffffff;
}
```

### Логические свойства

```css
.logical-properties {
  /* Вместо left/right */
  margin-inline-start: 1rem;  /* margin-left в LTR */
  margin-inline-end: 1rem;    /* margin-right в LTR */
  margin-inline: 1rem 2rem;   /* Горизонтальные */
  
  /* Вместо top/bottom */
  margin-block-start: 1rem;   /* margin-top */
  margin-block-end: 1rem;     /* margin-bottom */
  margin-block: 1rem 2rem;    /* Вертикальные */
  
  /* Размеры */
  inline-size: 300px;         /* width */
  block-size: 200px;          /* height */
}
```

### Aspect Ratio

```css
.aspect-ratio {
  aspect-ratio: 16 / 9;       /* Широкоэкранное видео */
  aspect-ratio: 1;            /* Квадрат */
  width: 100%;
  max-width: 500px;
}

.video-container {
  aspect-ratio: 16 / 9;
}

.video-container iframe {
  width: 100%;
  height: 100%;
}
```

### Container Queries

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 300px) {
  .card {
    display: flex;
    gap: 1rem;
  }
  
  .card-image {
    flex: 0 0 40%;
  }
}
```

### Новые псевдоклассы

```css
/* :is() - группировка */
:is(h1, h2, h3) {
  margin-top: 0;
  color: #333;
}

/* :where() - нулевая специфичность */
:where(h1, h2, h3) {
  font-family: serif;
}

/* :has() - родительский селектор */
.card:has(img) {
  padding: 0;
}

.form-group:has(:invalid) {
  border-color: red;
}
```

---

## Заключение

### ✅ Лучшие практики

**Организация кода:**
- Используйте внешние CSS файлы
- Группируйте селекторы логически  
- Применяйте CSS переменные
- Следуйте методологии именования (BEM)

**Современный подход:**
- Flexbox и Grid для макетов
- Относительные единицы измерения
- Медиа-запросы для адаптивности
- CSS переменные для тем

**Производительность:**
- Минимизируйте селекторы
- Оптимизируйте анимации
- Используйте efficient селекторы

### ❌ Чего избегать

- `float` для макетов - используйте Flexbox/Grid
- `!important` без необходимости
- Инлайновые стили
- Фиксированные размеры в пикселях
- Сложные селекторы

### 📚 Полезные ресурсы

- **MDN Web Docs** - полная документация
- **CSS Tricks** - туториалы и гайды
- **Can I Use** - поддержка CSS свойств
- **Flexbox Froggy** - изучение Flexbox через игру
- **CSS Grid Garden** - изучение Grid в игровой форме