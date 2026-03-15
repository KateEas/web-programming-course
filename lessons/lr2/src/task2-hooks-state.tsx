/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import { useState, useEffect, useCallback } from 'react';

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

// TODO: Определите интерфейс CounterState со следующими свойствами:
// - count: number
// - step: number
// - isRunning: boolean
// - history: number[]

// TODO: Типизируйте компонент Counter
function Counter() {
  // TODO: Добавьте типизацию к useState
  const [state, setState] = useState(/* TODO: добавьте типизацию и начальное значение */);

  // TODO: Добавьте типизацию к функциям
  const increment = () => {
    // TODO: реализуйте increment с обновлением истории
  };

  const decrement = () => {
    // TODO: реализуйте decrement с обновлением истории
  };

  const setStep = (newStep: /* TODO: добавьте тип */) => {
    // TODO: реализуйте изменение шага
  };

  const toggleRunning = () => {
    // TODO: реализуйте переключение автоинкремента
  };

  const reset = () => {
    // TODO: реализуйте сброс состояния
  };

  // TODO: Добавьте useEffect с типизацией для автоинкремента
  useEffect(() => {
    // TODO: реализуйте автоинкремент когда isRunning === true
  }, [/* TODO: зависимости */]);

  return (
    <div className="counter">
      <h2>Счетчик: {/* TODO: отобразите count */}</h2>
      <p>Шаг: {/* TODO: отобразите step */}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {/* TODO: отобразите текст на основе isRunning */}
        </button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={/* TODO: используйте step */}
            onChange={(e) => setStep(/* TODO: преобразуйте в число */)}
            min="1"
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {/* TODO: отрендерите историю значений */}
        </ul>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// TODO: Типизируйте компонент TodoApp
function TodoApp() {
  const [todos, setTodos] = useState</* TODO: добавьте тип */>(/* TODO: начальное значение */);
  const [newTodoText, setNewTodoText] = useState<string>('');

  const addTodo = (e: /* TODO: добавьте тип события */) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      // TODO: создайте новую todo и добавьте в массив
      // Подсказка: используйте Date.now().toString() для id
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    // TODO: измените completed статус для todo с данным id
  };

  const deleteTodo = (id: string) => {
    // TODO: удалите todo с данным id
  };

  // TODO: Посчитайте количество завершенных todos
  const completedCount = 0;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      {/* TODO: Форма добавления */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">
          Добавить
        </button>
      </form>

      {/* TODO: Список todos */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      {/* TODO: Отобразите статистику */}
      <div className="stats">
        <p>Всего: {/* TODO */}</p>
        <p>Завершено: {/* TODO */}</p>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.3: Кастомные хуки =====

// TODO: Создайте типизированный хук useToggle
// Параметры: initialValue?: boolean
// Возвращает: [boolean, () => void] (value, toggle)
function useToggle(/* TODO: добавьте параметры и типизацию */) {
  // TODO: реализуйте логику с useState
}

// TODO: Создайте типизированный хук useCounter
// Параметры: initialValue?: number
// Возвращает: { count: number, increment: () => void, decrement: () => void, reset: () => void }
function useCounter(/* TODO: добавьте параметры и типизацию */) {
  // TODO: реализуйте логику с useState
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

// TODO: Типизируйте компонент HooksDemo
function HooksDemo() {
  // TODO: Используйте созданные кастомные хуки

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      {/* TODO: Демо useCounter */}
      <div className="demo-section">
        <h3>useCounter</h3>
        {/* TODO: используйте useCounter и добавьте кнопки */}
      </div>

      {/* TODO: Демо useToggle */}
      <div className="demo-section">
        <h3>useToggle</h3>
        {/* TODO: используйте useToggle и добавьте кнопку */}
      </div>
    </div>
  );
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
const TABS = {
  'counter': {
    'text': 'Счетчик',
    'component': () => <Counter />,
  },
  'todos': {
    'text': 'Todo',
    'component': () => <TodoApp />,
  },
  'hooks':{
    'text': 'Хуки',
    'component': () => <HooksDemo />,
  },
};

// TODO: Типизируйте компонент App
function App() {
  const [activeTab, setActiveTab] = useState<>('counter');

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key as keyof typeof TABS)}
          >
            {tab.text}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {TABS[activeTab].component()}
      </div>
    </div>
  );
}

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Создайте хук useLocalStorage
// Параметры: key: string, initialValue: T
// Возвращает: [T, (value: T | ((val: T) => T)) => void]
// TODO BONUS 2: Создайте хук usePrevious для отслеживания предыдущего значения
// TODO BONUS 3: Реализуйте TodoApp с useReducer вместо useState