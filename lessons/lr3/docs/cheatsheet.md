# Шпаргалка: Tailwind CSS

## Быстрый справочник по Tailwind CSS

### 📋 Содержание
- [Layout](#layout)
- [Flexbox](#flexbox)
- [Grid](#grid)
- [Spacing](#spacing)
- [Sizing](#sizing)
- [Typography](#typography)
- [Colors](#colors)
- [Backgrounds](#backgrounds)
- [Borders](#borders)
- [Effects](#effects)
- [Responsive Design](#responsive-design)
- [Pseudo-классы](#pseudo-классы)

---

## Layout

### Display
```css
block          /* display: block */
inline-block   /* display: inline-block */
inline         /* display: inline */
flex           /* display: flex */
inline-flex    /* display: inline-flex */
grid           /* display: grid */
inline-grid    /* display: inline-grid */
hidden         /* display: none */
```

### Position
```css
static         /* position: static */
fixed          /* position: fixed */
absolute       /* position: absolute */
relative       /* position: relative */
sticky         /* position: sticky */
```

### Overflow
```css
overflow-auto     /* overflow: auto */
overflow-hidden   /* overflow: hidden */
overflow-visible  /* overflow: visible */
overflow-scroll   /* overflow: scroll */
overflow-x-auto   /* overflow-x: auto */
overflow-y-auto   /* overflow-y: auto */
```

---

## Flexbox

### Flex Direction
```css
flex-row          /* flex-direction: row */
flex-row-reverse  /* flex-direction: row-reverse */
flex-col          /* flex-direction: column */
flex-col-reverse  /* flex-direction: column-reverse */
```

### Justify Content
```css
justify-start     /* justify-content: flex-start */
justify-end       /* justify-content: flex-end */
justify-center    /* justify-content: center */
justify-between   /* justify-content: space-between */
justify-around    /* justify-content: space-around */
justify-evenly    /* justify-content: space-evenly */
```

### Align Items
```css
items-start      /* align-items: flex-start */
items-end        /* align-items: flex-end */
items-center     /* align-items: center */
items-baseline   /* align-items: baseline */
items-stretch    /* align-items: stretch */
```

### Gap
```css
gap-0     /* gap: 0 */
gap-1     /* gap: 0.25rem (4px) */
gap-2     /* gap: 0.5rem (8px) */
gap-3     /* gap: 0.75rem (12px) */
gap-4     /* gap: 1rem (16px) */
gap-6     /* gap: 1.5rem (24px) */
gap-8     /* gap: 2rem (32px) */
```

### Flex Wrap
```css
flex-wrap         /* flex-wrap: wrap */
flex-wrap-reverse /* flex-wrap: wrap-reverse */
flex-nowrap       /* flex-wrap: nowrap */
```

---

## Grid

### Grid Template Columns
```css
grid-cols-1      /* grid-template-columns: repeat(1, minmax(0, 1fr)) */
grid-cols-2      /* grid-template-columns: repeat(2, minmax(0, 1fr)) */
grid-cols-3      /* grid-template-columns: repeat(3, minmax(0, 1fr)) */
grid-cols-4      /* grid-template-columns: repeat(4, minmax(0, 1fr)) */
grid-cols-6      /* grid-template-columns: repeat(6, minmax(0, 1fr)) */
grid-cols-12     /* grid-template-columns: repeat(12, minmax(0, 1fr)) */
```

### Grid Template Rows
```css
grid-rows-1      /* grid-template-rows: repeat(1, minmax(0, 1fr)) */
grid-rows-2      /* grid-template-rows: repeat(2, minmax(0, 1fr)) */
grid-rows-3      /* grid-template-rows: repeat(3, minmax(0, 1fr)) */
grid-rows-4      /* grid-template-rows: repeat(4, minmax(0, 1fr)) */
```

### Grid Column Span
```css
col-span-1       /* grid-column: span 1 / span 1 */
col-span-2       /* grid-column: span 2 / span 2 */
col-span-3       /* grid-column: span 3 / span 3 */
col-span-full    /* grid-column: 1 / -1 */
```

---

## Spacing

### Padding (все стороны)
```css
p-0    /* padding: 0 */
p-1    /* padding: 0.25rem (4px) */
p-2    /* padding: 0.5rem (8px) */
p-3    /* padding: 0.75rem (12px) */
p-4    /* padding: 1rem (16px) */
p-6    /* padding: 1.5rem (24px) */
p-8    /* padding: 2rem (32px) */
p-12   /* padding: 3rem (48px) */
```

### Padding (специфичные стороны)
```css
px-4   /* padding-left & padding-right: 1rem */
py-4   /* padding-top & padding-bottom: 1rem */
pt-4   /* padding-top: 1rem */
pr-4   /* padding-right: 1rem */
pb-4   /* padding-bottom: 1rem */
pl-4   /* padding-left: 1rem */
```

### Margin (аналогично padding)
```css
m-0, m-1, m-2, m-3, m-4, m-6, m-8, m-12
mx-4, my-4, mt-4, mr-4, mb-4, ml-4

/* Автоматический margin */
mx-auto   /* margin-left: auto; margin-right: auto */

/* Отрицательные значения */
-m-4, -mt-4, -mr-4, -mb-4, -ml-4
```

### Space Between
```css
space-x-2    /* gap между элементами по X */
space-y-2    /* gap между элементами по Y */
```

---

## Sizing

### Width
```css
w-0       /* width: 0 */
w-1       /* width: 0.25rem */
w-full    /* width: 100% */
w-screen  /* width: 100vw */
w-auto    /* width: auto */
w-1/2     /* width: 50% */
w-1/3     /* width: 33.333% */
w-1/4     /* width: 25% */
w-64      /* width: 16rem (256px) */
```

### Height
```css
h-0       /* height: 0 */
h-full    /* height: 100% */
h-screen  /* height: 100vh */
h-auto    /* height: auto */
h-64      /* height: 16rem (256px) */
```

### Min/Max Width
```css
min-w-0      /* min-width: 0 */
min-w-full   /* min-width: 100% */
max-w-xs     /* max-width: 20rem */
max-w-sm     /* max-width: 24rem */
max-w-md     /* max-width: 28rem */
max-w-lg     /* max-width: 32rem */
max-w-xl     /* max-width: 36rem */
max-w-2xl    /* max-width: 42rem */
max-w-full   /* max-width: 100% */
```

---

## Typography

### Font Size
```css
text-xs     /* font-size: 0.75rem (12px) */
text-sm     /* font-size: 0.875rem (14px) */
text-base   /* font-size: 1rem (16px) */
text-lg     /* font-size: 1.125rem (18px) */
text-xl     /* font-size: 1.25rem (20px) */
text-2xl    /* font-size: 1.5rem (24px) */
text-3xl    /* font-size: 1.875rem (30px) */
text-4xl    /* font-size: 2.25rem (36px) */
```

### Font Weight
```css
font-thin       /* font-weight: 100 */
font-light      /* font-weight: 300 */
font-normal     /* font-weight: 400 */
font-medium     /* font-weight: 500 */
font-semibold   /* font-weight: 600 */
font-bold       /* font-weight: 700 */
font-extrabold  /* font-weight: 800 */
```

### Text Align
```css
text-left     /* text-align: left */
text-center   /* text-align: center */
text-right    /* text-align: right */
text-justify  /* text-align: justify */
```

### Text Color
```css
text-black      /* color: #000 */
text-white      /* color: #fff */
text-gray-500   /* color: #6b7280 */
text-red-500    /* color: #ef4444 */
text-blue-500   /* color: #3b82f6 */
```

### Line Height
```css
leading-none      /* line-height: 1 */
leading-tight     /* line-height: 1.25 */
leading-normal    /* line-height: 1.5 */
leading-relaxed   /* line-height: 1.625 */
leading-loose     /* line-height: 2 */
```

---

## Colors

### Background Colors
```css
bg-transparent
bg-white
bg-black
bg-gray-100 ... bg-gray-900
bg-red-100 ... bg-red-900
bg-blue-100 ... bg-blue-900
bg-green-100 ... bg-green-900
bg-yellow-100 ... bg-yellow-900
```

### Text Colors
```css
text-transparent
text-white
text-black
text-gray-100 ... text-gray-900
text-red-500
text-blue-600
text-green-500
```

### Border Colors
```css
border-transparent
border-white
border-gray-300
border-red-500
border-blue-500
```

---

## Backgrounds

### Background Size
```css
bg-auto      /* background-size: auto */
bg-cover     /* background-size: cover */
bg-contain   /* background-size: contain */
```

### Background Position
```css
bg-center    /* background-position: center */
bg-top       /* background-position: top */
bg-bottom    /* background-position: bottom */
bg-left      /* background-position: left */
bg-right     /* background-position: right */
```

---

## Borders

### Border Width
```css
border        /* border-width: 1px */
border-0      /* border-width: 0 */
border-2      /* border-width: 2px */
border-4      /* border-width: 4px */
border-8      /* border-width: 8px */

/* Специфичные стороны */
border-t-2    /* border-top-width: 2px */
border-r-2    /* border-right-width: 2px */
border-b-2    /* border-bottom-width: 2px */
border-l-2    /* border-left-width: 2px */
```

### Border Radius
```css
rounded-none    /* border-radius: 0 */
rounded-sm      /* border-radius: 0.125rem (2px) */
rounded         /* border-radius: 0.25rem (4px) */
rounded-md      /* border-radius: 0.375rem (6px) */
rounded-lg      /* border-radius: 0.5rem (8px) */
rounded-xl      /* border-radius: 0.75rem (12px) */
rounded-2xl     /* border-radius: 1rem (16px) */
rounded-3xl     /* border-radius: 1.5rem (24px) */
rounded-full    /* border-radius: 9999px */

/* Специфичные углы */
rounded-t-lg    /* border-top-left/right-radius: 0.5rem */
rounded-r-lg    /* border-top/bottom-right-radius: 0.5rem */
```

### Border Style
```css
border-solid    /* border-style: solid */
border-dashed   /* border-style: dashed */
border-dotted   /* border-style: dotted */
border-double   /* border-style: double */
border-none     /* border-style: none */
```

---

## Effects

### Box Shadow
```css
shadow-sm      /* box-shadow: 0 1px 2px rgba(0,0,0,0.05) */
shadow         /* box-shadow: 0 1px 3px rgba(0,0,0,0.1) */
shadow-md      /* box-shadow: 0 4px 6px rgba(0,0,0,0.1) */
shadow-lg      /* box-shadow: 0 10px 15px rgba(0,0,0,0.1) */
shadow-xl      /* box-shadow: 0 20px 25px rgba(0,0,0,0.1) */
shadow-2xl     /* box-shadow: 0 25px 50px rgba(0,0,0,0.25) */
shadow-none    /* box-shadow: none */
```

### Opacity
```css
opacity-0      /* opacity: 0 */
opacity-25     /* opacity: 0.25 */
opacity-50     /* opacity: 0.5 */
opacity-75     /* opacity: 0.75 */
opacity-100    /* opacity: 1 */
```

### Transitions
```css
transition-none       /* transition: none */
transition-all        /* transition: all */
transition-colors     /* transition: color, background-color... */
transition-opacity    /* transition: opacity */
transition-shadow     /* transition: box-shadow */
transition-transform  /* transition: transform */

/* Duration */
duration-75      /* transition-duration: 75ms */
duration-100     /* transition-duration: 100ms */
duration-150     /* transition-duration: 150ms */
duration-200     /* transition-duration: 200ms */
duration-300     /* transition-duration: 300ms */
duration-500     /* transition-duration: 500ms */
duration-1000    /* transition-duration: 1000ms */

/* Timing Function */
ease-linear      /* transition-timing-function: linear */
ease-in          /* transition-timing-function: ease-in */
ease-out         /* transition-timing-function: ease-out */
ease-in-out      /* transition-timing-function: ease-in-out */
```

---

## Responsive Design

### Breakpoints
```css
/* Tailwind breakpoints */
sm:   /* @media (min-width: 640px) */
md:   /* @media (min-width: 768px) */
lg:   /* @media (min-width: 1024px) */
xl:   /* @media (min-width: 1280px) */
2xl:  /* @media (min-width: 1536px) */
```

### Примеры использования
```html
<!-- Скрыть на мобильных, показать на планшетах+ -->
<div class="hidden md:block">Контент</div>

<!-- 1 колонка на мобильных, 2 на планшетах, 3 на десктопах -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- items -->
</div>

<!-- Маленький текст на мобильных, большой на десктопах -->
<p class="text-sm md:text-base lg:text-lg">Текст</p>

<!-- Полная ширина на мобильных, авто на десктопах -->
<button class="w-full lg:w-auto">Кнопка</button>

<!-- Разные отступы -->
<div class="p-2 md:p-4 lg:p-6">Контент</div>
```

---

## Pseudo-классы

### Hover
```css
hover:bg-blue-600      /* :hover background */
hover:text-red-500     /* :hover text color */
hover:scale-105        /* :hover transform scale */
hover:shadow-lg        /* :hover box-shadow */
```

### Focus
```css
focus:outline-none     /* :focus outline */
focus:ring-2           /* :focus ring */
focus:ring-blue-500    /* :focus ring color */
focus:border-blue-500  /* :focus border color */
```

### Active
```css
active:bg-blue-700     /* :active background */
active:scale-95        /* :active transform scale */
```

### Disabled
```css
disabled:opacity-50      /* :disabled opacity */
disabled:cursor-not-allowed  /* :disabled cursor */
```

### Group Hover
```html
<div class="group">
  <div class="group-hover:bg-blue-500">
    Изменится при hover на родителе
  </div>
</div>
```

---

## ⚡ Быстрые паттерны

### Центрирование
```html
<!-- Flex центрирование -->
<div class="flex items-center justify-center h-screen">
  <div>Контент по центру</div>
</div>

<!-- Grid центрирование -->
<div class="grid place-items-center h-screen">
  <div>Контент по центру</div>
</div>
```

### Карточка
```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
  <h2 class="text-xl font-bold mb-2">Заголовок</h2>
  <p class="text-gray-600">Описание карточки</p>
</div>
```

### Кнопка
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors">
  Нажми меня
</button>
```

### Input
```html
<input
  type="text"
  class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Введите текст"
/>
```

### Responsive навигация
```html
<nav class="flex flex-col md:flex-row gap-4 md:gap-6">
  <a href="#" class="text-gray-700 hover:text-blue-600">Главная</a>
  <a href="#" class="text-gray-700 hover:text-blue-600">О нас</a>
  <a href="#" class="text-gray-700 hover:text-blue-600">Контакты</a>
</nav>
```

---

## 🎨 Цветовая палитра

### Gray
```css
bg-gray-50, bg-gray-100, bg-gray-200, bg-gray-300,
bg-gray-400, bg-gray-500, bg-gray-600, bg-gray-700,
bg-gray-800, bg-gray-900
```

### Цветные шкалы
Аналогично для:
- `red-` : Красный
- `yellow-` : Желтый
- `green-` : Зеленый
- `blue-` : Синий
- `indigo-` : Индиго
- `purple-` : Фиолетовый
- `pink-` : Розовый

Каждый цвет имеет оттенки от 50 до 900.

---

## 🚨 Частые ошибки

### ❌ Что НЕ нужно делать
```html
<!-- Не используйте произвольные значения без необходимости -->
<div style="padding: 15px">Плохо</div>

<!-- Не создавайте кастомные CSS классы для всего -->
.my-custom-button { /* Избегайте */ }

<!-- Не используйте !important -->
<div class="!bg-red-500">Плохо (но иногда необходимо)</div>
```

### ✅ Что нужно делать
```html
<!-- Используйте Tailwind классы -->
<div class="p-4">Хорошо</div>

<!-- Группируйте похожие стили -->
<button class="btn-primary">Используйте @apply в CSS при необходимости</button>

<!-- Используйте responsive модификаторы -->
<div class="p-2 md:p-4 lg:p-6">Хорошо</div>
```

---

## 📚 Полезные команды

### Установка Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Конфигурация (tailwind.config.js)
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1e40af',
      },
    },
  },
  plugins: [],
}
```

### В CSS файле
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔗 Полезные ресурсы

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Play (Playground)](https://play.tailwindcss.com/)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)
